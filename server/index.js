const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const app = express();
const port = process.env.PORT || 3001;
const dataPath = path.join(__dirname, 'data.json');
const starterData = {
  students: [
    { id: 'STU-2024-084', name: 'Aanya Mehta', course: 'B.Tech · Computer Science', room: 'A-204', block: 'Block A', checkin: 'Aug 12, 2025', status: 'Active', initials: 'AM', color: 'avatar-pink' },
    { id: 'STU-2024-091', name: 'Rohan Kapoor', course: 'BBA · Business Analytics', room: 'B-108', block: 'Block B', checkin: 'Aug 14, 2025', status: 'Active', initials: 'RK', color: 'avatar-blue' },
    { id: 'STU-2024-103', name: 'Diya Patel', course: 'B.Sc · Biotechnology', room: 'A-312', block: 'Block A', checkin: 'Aug 18, 2025', status: 'Pending', initials: 'DP', color: 'avatar-yellow' },
    { id: 'STU-2024-117', name: 'Kabir Singh', course: 'B.Tech · Mechanical', room: 'C-206', block: 'Block C', checkin: 'Aug 20, 2025', status: 'Active', initials: 'KS', color: 'avatar-green' },
    { id: 'STU-2024-128', name: 'Mira Joshi', course: 'BA · Psychology', room: 'D-115', block: 'Block D', checkin: 'Aug 22, 2025', status: 'Inactive', initials: 'MJ', color: 'avatar-purple' }
  ],
  rooms: [
    { id: 'A-204', block: 'Block A', type: '2 sharing', capacity: 2, occupied: 1, price: 8500, status: 'Available' },
    { id: 'A-312', block: 'Block A', type: '3 sharing', capacity: 3, occupied: 1, price: 7000, status: 'Available' },
    { id: 'B-108', block: 'Block B', type: '2 sharing', capacity: 2, occupied: 1, price: 8500, status: 'Available' },
    { id: 'B-210', block: 'Block B', type: '3 sharing', capacity: 3, occupied: 0, price: 7000, status: 'Available' },
    { id: 'C-206', block: 'Block C', type: '2 sharing', capacity: 2, occupied: 1, price: 8500, status: 'Available' },
    { id: 'D-115', block: 'Block D', type: '2 sharing', capacity: 2, occupied: 1, price: 8500, status: 'Available' }
  ],
  fees: [
    { id: 'FEE-2041', student: 'Aanya Mehta', studentId: 'STU-2024-084', room: 'A-204', amount: 8500, dueDate: 'Nov 05, 2026', status: 'Paid' },
    { id: 'FEE-2042', student: 'Rohan Kapoor', studentId: 'STU-2024-091', room: 'B-108', amount: 8500, dueDate: 'Nov 05, 2026', status: 'Pending' },
    { id: 'FEE-2043', student: 'Diya Patel', studentId: 'STU-2024-103', room: 'A-312', amount: 7000, dueDate: 'Nov 05, 2026', status: 'Overdue' },
    { id: 'FEE-2044', student: 'Kabir Singh', studentId: 'STU-2024-117', room: 'C-206', amount: 8500, dueDate: 'Nov 05, 2026', status: 'Pending' },
    { id: 'FEE-2045', student: 'Mira Joshi', studentId: 'STU-2024-128', room: 'D-115', amount: 8500, dueDate: 'Nov 05, 2026', status: 'Paid' }
  ],
  requests: [
    { id: 'REQ-3021', student: 'Aanya Mehta', room: 'A-204', category: 'Maintenance', title: 'Bathroom tap is leaking', date: 'Oct 26, 2026', priority: 'High', status: 'Open' },
    { id: 'REQ-3022', student: 'Rohan Kapoor', room: 'B-108', category: 'Housekeeping', title: 'Room cleaning request', date: 'Oct 26, 2026', priority: 'Normal', status: 'Open' },
    { id: 'REQ-3023', student: 'Diya Patel', room: 'A-312', category: 'Maintenance', title: 'Desk lamp not working', date: 'Oct 25, 2026', priority: 'Normal', status: 'In progress' },
    { id: 'REQ-3024', student: 'Kabir Singh', room: 'C-206', category: 'Other', title: 'Requesting a visitor pass', date: 'Oct 24, 2026', priority: 'Normal', status: 'Resolved' }
  ]
};

let data;
try { data = JSON.parse(fs.readFileSync(dataPath, 'utf8')); }
catch { data = starterData; saveData(); }

function saveData() { fs.writeFileSync(dataPath, JSON.stringify(data, null, 2)); }
function findById(collection, id) { return collection.find(item => item.id === id); }
function requireFields(body, fields, res) {
  const missing = fields.filter(field => body[field] === undefined || body[field] === null || body[field] === '');
  if (missing.length) { res.status(400).json({ error: `Required fields: ${missing.join(', ')}` }); return false; }
  return true;
}

app.use(express.json());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && /^http:\/\/localhost:\d+$/.test(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Hostel Management API' }));
app.get('/api/dashboard', (req, res) => {
  const capacity = data.rooms.reduce((sum, room) => sum + Number(room.capacity), 0) || 1;
  const occupied = data.rooms.reduce((sum, room) => sum + Number(room.occupied), 0);
  const expected = data.fees.reduce((sum, fee) => sum + Number(fee.amount), 0);
  const collected = data.fees.filter(fee => fee.status === 'Paid').reduce((sum, fee) => sum + Number(fee.amount), 0);
  res.json({ students: data.students.length, occupancy: Math.round(occupied / capacity * 100), occupied, capacity, collected, expected, feePercent: expected ? Math.round(collected / expected * 100) : 0, requests: data.requests.filter(request => request.status !== 'Resolved').length });
});

app.get('/api/students', (req, res) => res.json(data.students));
app.post('/api/students', (req, res) => {
  if (!requireFields(req.body, ['name', 'course', 'room', 'block'], res)) return;
  const name = String(req.body.name).trim();
  const room = findById(data.rooms, String(req.body.room).trim());
  if (!room) return res.status(400).json({ error: 'Choose a room that exists in the room directory.' });
  if (room && room.occupied >= room.capacity) return res.status(409).json({ error: 'This room is full. Choose an available room.' });
  const student = { id: `STU-${Date.now()}`, name, course: String(req.body.course).trim(), room: room.id, block: room.block, checkin: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), status: 'Active', initials: name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(), color: 'avatar-blue' };
  data.students.unshift(student);
  if (room && room.occupied < room.capacity) { room.occupied += 1; room.status = room.occupied >= room.capacity ? 'Full' : 'Available'; }
  data.fees.unshift({ id: `FEE-${Date.now()}`, student: student.name, studentId: student.id, room: student.room, amount: room?.price || 8500, dueDate: 'Nov 05, 2026', status: 'Pending' });
  saveData();
  res.status(201).json(student);
});
app.put('/api/students/:id', (req, res) => {
  const student = findById(data.students, req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  if (!requireFields(req.body, ['name', 'course', 'room', 'block', 'status'], res)) return;
  const nextRoom = findById(data.rooms, String(req.body.room).trim());
  if (!nextRoom) return res.status(400).json({ error: 'Choose a room that exists in the room directory.' });
  if (req.body.room !== student.room && nextRoom && nextRoom.occupied >= nextRoom.capacity) return res.status(409).json({ error: 'The selected room is full.' });
  if (req.body.room !== student.room) {
    const previousRoom = findById(data.rooms, student.room);
    if (previousRoom && previousRoom.occupied > 0) { previousRoom.occupied -= 1; previousRoom.status = 'Available'; }
    if (nextRoom) { nextRoom.occupied += 1; nextRoom.status = nextRoom.occupied >= nextRoom.capacity ? 'Full' : 'Available'; }
  }
  Object.assign(student, req.body, { initials: String(req.body.name).split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() });
  student.block = nextRoom.block;
  for (const fee of data.fees.filter(item => item.studentId === student.id)) fee.room = student.room;
  saveData();
  res.json(student);
});
app.delete('/api/students/:id', (req, res) => {
  const index = data.students.findIndex(student => student.id === req.params.id);
  if (index < 0) return res.status(404).json({ error: 'Student not found' });
  const [removed] = data.students.splice(index, 1);
  const room = findById(data.rooms, removed.room);
  if (room && room.occupied > 0) { room.occupied -= 1; room.status = 'Available'; }
  data.fees = data.fees.filter(fee => fee.studentId !== removed.id);
  saveData();
  res.sendStatus(204);
});

app.get('/api/rooms', (req, res) => res.json(data.rooms));
app.post('/api/rooms', (req, res) => {
  if (!requireFields(req.body, ['id', 'block', 'type', 'capacity', 'price'], res)) return;
  const id = String(req.body.id).trim().toUpperCase();
  const capacity = Number(req.body.capacity);
  const price = Number(req.body.price);
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 20 || !Number.isFinite(price) || price < 0) return res.status(400).json({ error: 'Enter a valid bed capacity and monthly fee.' });
  if (findById(data.rooms, id)) return res.status(409).json({ error: 'That room number already exists' });
  const room = { ...req.body, id, capacity, price, occupied: 0, status: 'Available' };
  data.rooms.push(room); saveData(); res.status(201).json(room);
});
app.get('/api/fees', (req, res) => res.json(data.fees));
app.put('/api/fees/:id', (req, res) => {
  const fee = findById(data.fees, req.params.id);
  if (!fee) return res.status(404).json({ error: 'Fee record not found' });
  if (!['Pending', 'Paid', 'Overdue'].includes(req.body.status)) return res.status(400).json({ error: 'Status must be Pending, Paid, or Overdue' });
  fee.status = req.body.status; saveData(); res.json(fee);
});
app.get('/api/requests', (req, res) => res.json(data.requests));
app.post('/api/requests', (req, res) => {
  if (!requireFields(req.body, ['student', 'room', 'category', 'title', 'priority'], res)) return;
  const request = { id: `REQ-${Date.now()}`, student: String(req.body.student).trim(), room: String(req.body.room).trim(), category: String(req.body.category), title: String(req.body.title).trim(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), priority: req.body.priority === 'High' ? 'High' : 'Normal', status: 'Open' };
  data.requests.unshift(request); saveData(); res.status(201).json(request);
});
app.put('/api/requests/:id', (req, res) => {
  const request = findById(data.requests, req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (!['Open', 'In progress', 'Resolved'].includes(req.body.status)) return res.status(400).json({ error: 'Invalid request status' });
  request.status = req.body.status; saveData(); res.json(request);
});
app.get('/api/reports', (req, res) => res.json({ dashboard: { students: data.students.length, rooms: data.rooms.length, occupiedBeds: data.rooms.reduce((sum, room) => sum + Number(room.occupied), 0), totalBeds: data.rooms.reduce((sum, room) => sum + Number(room.capacity), 0), feeCollected: data.fees.filter(fee => fee.status === 'Paid').reduce((sum, fee) => sum + Number(fee.amount), 0), feeDue: data.fees.filter(fee => fee.status !== 'Paid').reduce((sum, fee) => sum + Number(fee.amount), 0), openRequests: data.requests.filter(request => request.status !== 'Resolved').length }, students: data.students, rooms: data.rooms, fees: data.fees, requests: data.requests }));

app.listen(port, () => console.log(`Hostel Management API running at http://localhost:${port}`));
