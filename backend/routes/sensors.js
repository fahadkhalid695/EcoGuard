const express = require('express');
const router = express.Router();

// Mock sensor data
const mockSensors = [
  { id: 'temp-001', name: 'Temperature Sensor', type: 'temperature', status: 'online' },
  { id: 'hum-001', name: 'Humidity Sensor', type: 'humidity', status: 'online' },
  { id: 'co2-001', name: 'CO2 Sensor', type: 'co2', status: 'online' },
  { id: 'motion-001', name: 'Motion Sensor', type: 'motion', status: 'online' }
];

router.get('/', (req, res) => {
  res.json({ success: true, data: mockSensors });
});

router.get('/:id', (req, res) => {
  const sensor = mockSensors.find(s => s.id === req.params.id);
  res.json({ success: true, data: sensor });
});

module.exports = router;