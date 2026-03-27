import { useEffect, useMemo, useState } from 'react';

const useSimulationPlayback = ({ simData, simulationParams, metrics, onSimulationDataChanged }) => {
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    if (!simData?.timeline?.length) {
      return;
    }
    setPlaybackIndex(0);
    setIsPlaybackActive(true);
    if (typeof onSimulationDataChanged === 'function') {
      onSimulationDataChanged();
    }
  }, [simData, onSimulationDataChanged]);

  useEffect(() => {
    if (!isPlaybackActive || !simData?.timeline?.length) {
      return;
    }

    const intervalMs = Math.max(220, 900 / playbackSpeed);
    const timer = setInterval(() => {
      setPlaybackIndex((prev) => {
        if (prev >= simData.timeline.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaybackActive, playbackSpeed, simData]);

  const currentFrame = simData?.timeline?.[playbackIndex] || null;
  const queueAgents = Math.max(
    2,
    Math.min(
      14,
      Math.round(((currentFrame?.utilization || 0) / 10) + Number(simulationParams.demandMultiplier || 1) * 1.5)
    )
  );
  const servingAgents = Math.max(1, Math.min(12, Math.round((currentFrame?.utilization || 0) / 9)));
  const topAnimatedRooms = (simData?.roomLoad || []).slice(0, 8);
  const pressuredRooms = (simData?.roomLoad || []).filter((room) => room.loadPct >= 75).length;
  const throughputPerHour = Number(metrics.served_count_avg || 0) / Math.max(1, Number(simulationParams.simulationHours || 1));

  const roomFlowBranches = useMemo(() => {
    const branchRooms = topAnimatedRooms.slice(0, 4);
    if (!branchRooms.length) {
      return [];
    }

    const anchors = [20, 38, 62, 80];
    const totalLoad = branchRooms.reduce((sum, room) => sum + Math.max(1, Number(room.loadPct || 0)), 0);
    const dispatchTotal = Math.max(
      5,
      Math.min(26, Math.round(((currentFrame?.utilization || 0) / 5.2) + branchRooms.length * 2))
    );

    return branchRooms.map((room, idx) => {
      const weight = Math.max(1, Number(room.loadPct || 0)) / Math.max(1, totalLoad);
      const roomDispatch = Math.max(1, Math.round(dispatchTotal * weight));
      return {
        roomId: room.roomId,
        roomName: room.roomName,
        loadPct: room.loadPct,
        pressure: room.pressure,
        targetY: anchors[idx] || Math.min(84, 20 + idx * 16),
        agentCount: roomDispatch,
      };
    });
  }, [topAnimatedRooms, currentFrame]);

  const branchAgents = useMemo(() => {
    return roomFlowBranches.flatMap((branch, branchIdx) => {
      return Array.from({ length: branch.agentCount }).map((_, idx) => ({
        id: `br-${branch.roomId}-${idx}`,
        targetY: branch.targetY,
        loadPct: branch.loadPct,
        delay: ((idx * 0.17) + (branchIdx * 0.31)) % 2.8,
        duration: Math.max(1.4, 3.25 - (currentFrame?.utilization || 0) / 130 + (100 - branch.loadPct) / 260),
      }));
    });
  }, [roomFlowBranches, currentFrame]);

  const flowAgents = useMemo(() => {
    if (!currentFrame) {
      return { intake: [], service: [] };
    }

    const intakeCount = Math.max(
      6,
      Math.min(
        26,
        Math.round((currentFrame.utilization / 4.8) + Number(simulationParams.demandMultiplier || 1) * 2)
      )
    );
    const serviceCount = Math.max(4, Math.min(18, Math.round(currentFrame.utilization / 6)));

    const intake = Array.from({ length: intakeCount }).map((_, idx) => {
      const lane = idx % 3;
      return {
        id: `in-${idx}`,
        lane,
        delay: (idx * 0.23) % 2.8,
        duration: Math.max(1.8, 3.9 - (currentFrame.utilization / 100) * 1.35 + lane * 0.2),
      };
    });

    const service = Array.from({ length: serviceCount }).map((_, idx) => {
      const lane = idx % 3;
      return {
        id: `sv-${idx}`,
        lane,
        delay: (idx * 0.18) % 2.2,
        duration: Math.max(1.5, 3.1 - (currentFrame.utilization / 100) * 1.1 + lane * 0.18),
      };
    });

    return { intake, service };
  }, [currentFrame, simulationParams.demandMultiplier]);

  const timelineBars = useMemo(() => {
    const rows = simData?.timeline || [];
    return rows.map((row) => {
      const utilization = Number(row?.utilization || 0);
      return {
        period: row.period,
        utilization,
        normalized: Math.min(100, Math.max(5, utilization)),
      };
    });
  }, [simData]);

  return {
    playbackIndex,
    isPlaybackActive,
    setIsPlaybackActive,
    playbackSpeed,
    setPlaybackSpeed,
    currentFrame,
    queueAgents,
    servingAgents,
    topAnimatedRooms,
    pressuredRooms,
    throughputPerHour,
    roomFlowBranches,
    branchAgents,
    flowAgents,
    timelineBars,
  };
};

export default useSimulationPlayback;
