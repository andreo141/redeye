export const useSensor = () => {
  const formatSensorName = (sensor: string) => {
    const match = sensor.match(/^zigbee2mqtt\/motion-sensor-(.+)$/);

    if (match) {
      return `Motion Sensor ${match[1]}`;
    }

    return sensor;
  };

  return {
    formatSensorName,
  };
};
