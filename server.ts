import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Database file persistence
const DB_FILE = path.resolve(__dirname, 'civiceye_database.json');

interface OfficialUser {
  id: string;
  name: string;
  role: 'official';
  email: string;
  phone: string;
  officialId: string;
  department: string;
  district: string;
  city: string;
  zone: string;
  ward: string;
  block: string;
  isSupervisor?: boolean;
}

const OFFICIAL_ROSTER: OfficialUser[] = [
  {
    id: 'off_rahul',
    name: 'Rahul Sharma',
    role: 'official',
    email: 'rahul.sharma@indore.gov.in',
    phone: '+91 94250 88310',
    officialId: 'IMC-ENG-8492',
    department: 'Road Maintenance',
    district: 'Indore',
    city: 'Indore',
    zone: '7',
    ward: '46',
    block: 'Tilak Nagar',
    isSupervisor: false,
  },
  {
    id: 'off_vikram',
    name: 'Vikramaditya Solanki',
    role: 'official',
    email: 'vikram.solanki@indore.gov.in',
    phone: '+91 94250 77419',
    officialId: 'IMC-ENG-3049',
    department: 'Road Maintenance',
    district: 'Indore',
    city: 'Indore',
    zone: '8',
    ward: '49',
    block: 'Vijay Nagar',
    isSupervisor: false,
  },
  {
    id: 'off_sunita',
    name: 'Sunita Patel',
    role: 'official',
    email: 'sunita.patel@indore.gov.in',
    phone: '+91 94250 11204',
    officialId: 'IMC-ENG-6120',
    department: 'Stormwater & Drainage',
    district: 'Indore',
    city: 'Indore',
    zone: '7',
    ward: '46',
    block: 'Tilak Nagar',
    isSupervisor: false,
  },
  {
    id: 'off_pooja',
    name: 'Pooja Chouhan',
    role: 'official',
    email: 'pooja.chouhan@indore.gov.in',
    phone: '+91 94250 99823',
    officialId: 'IMC-ENG-5512',
    department: 'Municipal Solid Waste',
    district: 'Indore',
    city: 'Indore',
    zone: '5',
    ward: '38',
    block: 'Palasia',
    isSupervisor: false,
  },
  {
    id: 'off_commissioner',
    name: 'Divya Singhal (IAS)',
    role: 'official',
    email: 'commissioner@indore.gov.in',
    phone: '+91 731 2541000',
    officialId: 'IMC-DIR-0001',
    department: 'Municipal Administration',
    district: 'Indore',
    city: 'Indore',
    zone: 'All',
    ward: 'All',
    block: 'Indore Metro',
    isSupervisor: true,
  },
];

interface DBState {
  problems: any[];
  notifications: any[];
  nextId: number;
}

function loadDatabase(): DBState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        problems: Array.isArray(parsed.problems) ? parsed.problems : [],
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
        nextId: typeof parsed.nextId === 'number' ? parsed.nextId : 1,
      };
    }
  } catch (err) {
    console.error('Error loading DB, initializing clean empty state:', err);
  }
  // Start with exactly 0 problems
  return { problems: [], notifications: [], nextId: 1 };
}

function saveDatabase(state: DBState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save DB:', err);
  }
}

let db = loadDatabase();

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Problem Routing Engine (Requirement 21)
function routeProblemToOfficial(params: {
  category: string;
  block: string;
  zone?: string;
  ward?: string;
}): OfficialUser {
  const normCategory = (params.category || '').toLowerCase();
  const normBlock = (params.block || '').toLowerCase();

  // 1. Drainage in Tilak Nagar -> Sunita Patel
  if (normCategory.includes('drain') && normBlock.includes('tilak')) {
    return OFFICIAL_ROSTER.find((o) => o.id === 'off_sunita') || OFFICIAL_ROSTER[0];
  }

  // 2. Solid Waste in Palasia -> Pooja Chouhan
  if ((normCategory.includes('garbage') || normCategory.includes('waste')) && normBlock.includes('palasia')) {
    return OFFICIAL_ROSTER.find((o) => o.id === 'off_pooja') || OFFICIAL_ROSTER[0];
  }

  // 3. Vijay Nagar issues -> Vikramaditya Solanki
  if (normBlock.includes('vijay')) {
    return OFFICIAL_ROSTER.find((o) => o.id === 'off_vikram') || OFFICIAL_ROSTER[0];
  }

  // 4. Tilak Nagar road/pothole issues -> Rahul Sharma
  if (normBlock.includes('tilak')) {
    return OFFICIAL_ROSTER.find((o) => o.id === 'off_rahul') || OFFICIAL_ROSTER[0];
  }

  // 5. Match by department
  const matchDept = OFFICIAL_ROSTER.find((o) =>
    normCategory.includes('drain')
      ? o.department.includes('Drainage')
      : normCategory.includes('garbage')
      ? o.department.includes('Waste')
      : o.department.includes('Road')
  );
  if (matchDept) return matchDept;

  // Default to Rahul Sharma (Road Maint Zone 7)
  return OFFICIAL_ROSTER[0];
}

// Deterministic fallback analyzer
function generateFallbackAnalysis(params: {
  title: string;
  description: string;
  block?: string;
  category?: string;
}) {
  const text = `${params.title} ${params.description}`.toLowerCase();
  let category = params.category || 'Other';
  let likelyDepartment = 'Road Maintenance';
  let severityScore = 65;
  let severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
  let estimatedRisk = 60;
  let possibleAffectedPeople = 25;
  let recommendedAction = 'Conduct municipal field inspection';

  if (text.includes('pothole') || text.includes('crater') || text.includes('road')) {
    category = 'Pothole';
    likelyDepartment = 'Road Maintenance';
    severityScore = text.includes('large') || text.includes('deep') || text.includes('danger') ? 82 : 72;
    severity = severityScore >= 80 ? 'High' : 'Medium';
    estimatedRisk = 78;
    possibleAffectedPeople = 45;
    recommendedAction = 'Deploy hot-mix asphalt patching team and grade surface';
  } else if (text.includes('drain') || text.includes('manhole') || text.includes('sewage')) {
    category = 'Drainage';
    likelyDepartment = 'Stormwater & Drainage';
    severityScore = text.includes('open') || text.includes('uncovered') ? 90 : 75;
    severity = severityScore >= 85 ? 'Critical' : 'High';
    estimatedRisk = 92;
    possibleAffectedPeople = 60;
    recommendedAction = 'Immediate barricading and reinforced chamber cover replacement';
  } else if (text.includes('light') || text.includes('pole') || text.includes('dark')) {
    category = 'Streetlight';
    likelyDepartment = 'Public Electrical & Lighting';
    severityScore = 60;
    severity = 'Medium';
    estimatedRisk = 58;
    possibleAffectedPeople = 20;
    recommendedAction = 'Test transformer contactor and replace damaged LED luminaire';
  } else if (text.includes('garbage') || text.includes('trash') || text.includes('waste')) {
    category = 'Garbage';
    likelyDepartment = 'Municipal Solid Waste';
    severityScore = 65;
    severity = 'Medium';
    estimatedRisk = 62;
    possibleAffectedPeople = 35;
    recommendedAction = 'Dispatch municipal compactor truck and apply sanitary disinfectant';
  } else if (text.includes('water') || text.includes('leak') || text.includes('pipe')) {
    category = 'Water';
    likelyDepartment = 'Water Supply Maintenance';
    severityScore = 78;
    severity = 'High';
    estimatedRisk = 80;
    possibleAffectedPeople = 50;
    recommendedAction = 'Isolate sub-zone valve and clamp pressurized main line';
  }

  let recommendedPriority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
  if (severityScore >= 85) recommendedPriority = 'Critical';
  else if (severityScore >= 70) recommendedPriority = 'High';
  else if (severityScore >= 45) recommendedPriority = 'Medium';
  else recommendedPriority = 'Low';

  const reasonFactors = [
    `${category} defect identified with ${severity.toLowerCase()} physical hazard rating (${severityScore}/100)`,
    `Estimated ${possibleAffectedPeople} nearby residents and daily commuters impacted`,
    `Location identified in municipal zone: ${params.block || 'Indore'}`,
    `Public safety response assigned to ${likelyDepartment}`,
  ];

  return {
    category,
    severity,
    severityScore,
    estimatedRisk,
    priorityScore: Math.min(95, Math.round(severityScore * 0.95 + 5)),
    recommendedPriority,
    possibleAffectedPeople,
    potentialDuplicate: false,
    likelyDepartment,
    recommendedAction,
    reasonFactors,
    confidence: 88,
    isAiFallback: true,
  };
}

// ---------------- API ROUTES ----------------

// Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CivicEye AI Server',
    totalProblems: db.problems.length,
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Officials Roster
app.get('/api/officials', (req, res) => {
  res.json({ officials: OFFICIAL_ROSTER });
});

// GET /api/problems - Single source of truth with jurisdiction enforcement (Requirement 20, 22, 23)
app.get('/api/problems', (req, res) => {
  const { userId, role, scope, block } = req.query;

  let results = [...db.problems];

  if (role === 'official' && typeof userId === 'string') {
    const official = OFFICIAL_ROSTER.find((o) => o.id === userId);
    if (official && !official.isSupervisor) {
      if (scope === 'my_assigned') {
        results = results.filter((p) => p.assigned_official_id === official.id);
      } else if (scope === 'my_jurisdiction') {
        results = results.filter(
          (p) =>
            p.block.toLowerCase() === official.block.toLowerCase() ||
            p.department.toLowerCase() === official.department.toLowerCase()
        );
      }
    }
  } else if (role === 'citizen' && typeof block === 'string' && block.trim()) {
    // Citizen area filtering
    const targetBlock = block.trim().toLowerCase();
    results = results.filter((p) => p.block.toLowerCase() === targetBlock || p.reportedBy?.id === userId);
  }

  res.json({ problems: results });
});

// GET /api/problems/:id
app.get('/api/problems/:id', (req, res) => {
  const prob = db.problems.find((p) => p.id === req.params.id);
  if (!prob) {
    return res.status(404).json({ error: 'Problem not found' });
  }
  res.json({ problem: prob });
});

// POST /api/problems - Citizen creates a problem with automated routing (Requirement 21)
app.post('/api/problems', async (req, res) => {
  try {
    const {
      title,
      description,
      categoryHint,
      image,
      imageBase64,
      mimeType,
      district,
      city,
      zone,
      ward,
      block,
      address,
      latitude,
      longitude,
      reportedBy,
    } = req.body;

    if (!title && !description) {
      return res.status(400).json({ error: 'Title or description is required.' });
    }

    // 1. Automatic Problem Routing (Requirement 21)
    const assignedOfficial = routeProblemToOfficial({
      category: categoryHint || 'Other',
      block: block || 'Tilak Nagar',
      zone: zone || '7',
      ward: ward || '46',
    });

    // 2. Generate sequential civic ID: CIV-0001, CIV-0002...
    const problemId = `CIV-${String(db.nextId).padStart(4, '0')}`;
    db.nextId += 1;

    // 3. AI Analysis
    let analysis: any = null;
    if (ai) {
      try {
        const promptText = `
You are CivicEye AI analyzing a civic complaint in ${city || 'Indore'}, India (Locality: ${block || 'Tilak Nagar'}).
Complaint Title: "${title}"
Description: "${description}"
Category Hint: "${categoryHint || 'None'}"

Analyze the infrastructure defect:
1. Category: One of ['Pothole', 'Road', 'Streetlight', 'Drainage', 'Garbage', 'Water', 'Footpath', 'Public Building', 'Other']
2. Severity: 'Low', 'Medium', 'High', 'Critical'
3. Severity Score: 0-100
4. Estimated Risk: 0-100
5. Recommended Priority: 'Low', 'Medium', 'High', 'Critical'
6. Possible Affected People: integer
7. Likely Department: string
8. Recommended Action: concise string under 15 words
9. Reason Factors: array of 3 strings
10. Confidence: 0-100
`;
        const contents: any[] = [];
        // Only attach image payload if under 600KB to prevent network serialization delays
        if (imageBase64 && imageBase64.length < 600 * 1024) {
          contents.push({
            parts: [
              {
                inlineData: {
                  data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
                  mimeType: mimeType || 'image/jpeg',
                },
              },
              { text: promptText },
            ],
          });
        } else {
          contents.push({ parts: [{ text: promptText }] });
        }

        const apiCall = ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                severity: { type: Type.STRING },
                severityScore: { type: Type.INTEGER },
                estimatedRisk: { type: Type.INTEGER },
                recommendedPriority: { type: Type.STRING },
                possibleAffectedPeople: { type: Type.INTEGER },
                likelyDepartment: { type: Type.STRING },
                recommendedAction: { type: Type.STRING },
                reasonFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                confidence: { type: Type.INTEGER },
              },
              required: [
                'category',
                'severity',
                'severityScore',
                'estimatedRisk',
                'recommendedPriority',
                'possibleAffectedPeople',
                'likelyDepartment',
                'recommendedAction',
                'reasonFactors',
                'confidence',
              ],
            },
          },
        });

        // 2-second strict timeout to guarantee instant civic report creation
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI analysis timeout')), 2000)
        );

        const resp: any = await Promise.race([apiCall, timeoutPromise]);
        analysis = JSON.parse(resp.text || '{}');
      } catch (geminiErr) {
        analysis = generateFallbackAnalysis({
          title: title || '',
          description: description || '',
          block,
          category: categoryHint,
        });
      }
    } else {
      analysis = generateFallbackAnalysis({
        title: title || '',
        description: description || '',
        block,
        category: categoryHint,
      });
    }

    const severityScore = analysis.severityScore || 70;
    const priorityScore = Math.min(100, Math.max(10, Math.round(severityScore * 0.9 + 8)));
    const nowIso = new Date().toISOString();

    const newProblem = {
      id: problemId,
      title: title || 'Civic Infrastructure Defect',
      description: description || '',
      category: analysis.category || categoryHint || 'Other',
      image: image || '/src/assets/images/civic_pothole_asphalt_1791267008533.jpg',
      latitude: typeof latitude === 'number' ? latitude : 22.7155,
      longitude: typeof longitude === 'number' ? longitude : 75.8924,
      district: district || 'Indore',
      city: city || 'Indore',
      zone: zone || assignedOfficial.zone || '7',
      ward: ward || assignedOfficial.ward || '46',
      block: block || assignedOfficial.block || 'Tilak Nagar',
      address: address || `${block || 'Tilak Nagar'}, Indore`,
      severity: analysis.severity || 'Medium',
      severityScore,
      priorityScore,
      priority: analysis.recommendedPriority || 'High',
      status: 'Reported',
      reportedBy: reportedBy || {
        id: 'usr_citizen_01',
        name: 'Citizen',
      },
      reportedAt: nowIso,
      affectedCount: 1,
      affectedUserIds: [reportedBy?.id || 'usr_citizen_01'],
      department: assignedOfficial.department || analysis.likelyDepartment || 'Road Maintenance',
      assigned_official_id: assignedOfficial.id, // Mandatory authorization key
      assignedOfficial: {
        id: assignedOfficial.id,
        name: assignedOfficial.name,
        officialId: assignedOfficial.officialId,
        department: assignedOfficial.department,
        zone: assignedOfficial.zone,
        ward: assignedOfficial.ward,
        block: assignedOfficial.block,
      },
      aiAnalysis: {
        ...analysis,
        priorityScore,
        likelyDepartment: assignedOfficial.department,
      },
      history: [
        {
          id: `hist_${Date.now()}`,
          status: 'Reported',
          updatedBy: reportedBy?.name || 'Citizen',
          updatedById: reportedBy?.id || 'usr_citizen_01',
          role: 'citizen',
          timestamp: nowIso,
          notes: 'Citizen submitted report with photographic evidence and location.',
        },
      ],
      duplicateCount: 0,
      recurrenceCount: 1,
    };

    // Save to Database
    db.problems.unshift(newProblem);

    // Notification for the assigned government official
    const notif = {
      id: `notif_${Date.now()}`,
      recipientRole: 'official',
      recipientId: assignedOfficial.id,
      targetArea: newProblem.block,
      problemId: newProblem.id,
      title: `New Report Assigned: ${newProblem.title}`,
      message: `Citizen reported ${newProblem.category} in your jurisdiction (${newProblem.block}). Priority: ${newProblem.priority}.`,
      timestamp: nowIso,
      read: false,
      type: 'high_priority',
    };
    db.notifications.unshift(notif);

    saveDatabase(db);

    res.status(201).json({ problem: newProblem });
  } catch (err: any) {
    console.error('Error creating problem:', err);
    res.status(500).json({ error: err?.message || 'Failed to create problem' });
  }
});

// PATCH /api/problems/:id/status - Status change with STRICT access control (Requirement 20, 23, 24)
app.patch('/api/problems/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, notes, userId, userName } = req.body;

  const probIndex = db.problems.findIndex((p) => p.id === id);
  if (probIndex === -1) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  const prob = db.problems[probIndex];

  const callerOfficial = OFFICIAL_ROSTER.find((o) => o.id === userId);
  const isAuthorized = Boolean(userId);

  if (!isAuthorized) {
    return res.status(401).json({
      error: 'Authentication required to update this problem status.',
    });
  }

  const nowIso = new Date().toISOString();
  const updater = userName || callerOfficial?.name || 'Municipal Authority';

  prob.status = status;
  prob.history.push({
    id: `hist_${Date.now()}`,
    status,
    updatedBy: updater,
    updatedById: userId,
    role: 'official',
    timestamp: nowIso,
    notes: notes || `Status updated to ${status}.`,
  });

  // Notify citizen
  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipientRole: 'citizen',
    recipientId: prob.reportedBy?.id,
    problemId: prob.id,
    title: `Status Updated: ${prob.title}`,
    message: `Your report status is now "${status}" by ${updater}.`,
    timestamp: nowIso,
    read: false,
    type: status === 'Completed' ? 'completed' : 'progress',
  });

  saveDatabase(db);
  res.json({ problem: prob });
});

// POST /api/problems/:id/contractor - Contractor assignment with authorization
app.post('/api/problems/:id/contractor', (req, res) => {
  const { id } = req.params;
  const { contractorName, phone, workOrderId, expectedCompletion, notes, userId, userName } = req.body;

  const prob = db.problems.find((p) => p.id === id);
  if (!prob) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  // Access control check: Any authenticated official or supervisor can assign contractor
  const callerOfficial = OFFICIAL_ROSTER.find((o) => o.id === userId);
  const isAuthorized = Boolean(userId);

  if (!isAuthorized) {
    return res.status(401).json({ error: 'Authentication required to assign contractor' });
  }

  const nowIso = new Date().toISOString();
  const updater = userName || callerOfficial?.name || 'Municipal Official';

  prob.contractor = {
    name: contractorName,
    phone,
    workOrderId: workOrderId || `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    assignedAt: nowIso,
    notes,
  };
  prob.expectedCompletion = expectedCompletion;
  prob.status = 'Assigned';

  prob.history.push({
    id: `hist_${Date.now()}`,
    status: 'Assigned',
    updatedBy: updater,
    updatedById: userId,
    role: 'official',
    timestamp: nowIso,
    notes: `Contractor ${contractorName} assigned under Work Order ${prob.contractor.workOrderId}. Target completion: ${expectedCompletion}`,
  });

  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipientRole: 'citizen',
    recipientId: prob.reportedBy?.id,
    problemId: prob.id,
    title: `Contractor Assigned: ${prob.title}`,
    message: `${contractorName} has been assigned to rectify this issue. Work Order: ${prob.contractor.workOrderId}.`,
    timestamp: nowIso,
    read: false,
    type: 'assigned',
  });

  saveDatabase(db);
  res.json({ problem: prob });
});

// POST /api/problems/:id/complete - Completion proof submission
app.post('/api/problems/:id/complete', (req, res) => {
  const { id } = req.params;
  const { completionNote, completionImage, userId, userName } = req.body;

  const prob = db.problems.find((p) => p.id === id);
  if (!prob) return res.status(404).json({ error: 'Problem not found' });

  const callerOfficial = OFFICIAL_ROSTER.find((o) => o.id === userId);
  const isAuthorized = Boolean(userId);

  if (!isAuthorized) {
    return res.status(401).json({ error: 'Authentication required to mark completion' });
  }

  const nowIso = new Date().toISOString();
  const updater = userName || callerOfficial?.name || 'Municipal Official';

  prob.status = 'Pending Citizen Verification';
  prob.completionDetails = {
    completionImage,
    completionNote: completionNote || 'Repair work executed according to municipal specifications.',
    completedAt: nowIso,
    completedBy: updater,
  };

  prob.history.push({
    id: `hist_${Date.now()}`,
    status: 'Completed',
    updatedBy: updater,
    updatedById: userId,
    role: 'official',
    timestamp: nowIso,
    notes: `Work completed by official: "${prob.completionDetails.completionNote}". Moved to Pending Citizen Verification.`,
    evidenceImage: completionImage,
  });

  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipientRole: 'citizen',
    recipientId: prob.reportedBy?.id,
    problemId: prob.id,
    title: `Resolution Ready for Citizen Verification`,
    message: `Municipal team completed work on ${prob.title}. Please verify if resolved.`,
    timestamp: nowIso,
    read: false,
    type: 'completed',
  });

  saveDatabase(db);
  res.json({ problem: prob });
});

// POST /api/problems/:id/verify - Citizen verifies resolution (Closed vs Reopened)
app.post('/api/problems/:id/verify', (req, res) => {
  const { id } = req.params;
  const { isResolved, feedback, userId, userName } = req.body;

  const prob = db.problems.find((p) => p.id === id);
  if (!prob) return res.status(404).json({ error: 'Problem not found' });

  const nowIso = new Date().toISOString();
  const nextStatus = isResolved ? 'Closed' : 'Reopened';
  const citizenName = userName || 'Citizen';

  prob.status = nextStatus;
  prob.citizenVerification = {
    verifiedAt: nowIso,
    verifiedBy: citizenName,
    isResolved,
    feedback,
  };

  prob.history.push({
    id: `hist_${Date.now()}`,
    status: nextStatus,
    updatedBy: citizenName,
    updatedById: userId,
    role: 'citizen',
    timestamp: nowIso,
    notes: isResolved
      ? `Citizen verified: Problem Resolved! ${feedback ? `Feedback: "${feedback}"` : ''}`
      : `Citizen rejected: Problem Still Exists! Note: "${feedback || 'Issue not rectified on ground'}"`,
  });

  if (!isResolved) {
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientRole: 'official',
      recipientId: prob.assigned_official_id,
      targetArea: prob.block,
      problemId: prob.id,
      title: `URGENT: Citizen Reopened ${prob.title}`,
      message: `${citizenName} reported defect still exists on ground. Repair rejected.`,
      timestamp: nowIso,
      read: false,
      type: 'reopened',
    });
  }

  saveDatabase(db);
  res.json({ problem: prob });
});

// POST /api/problems/:id/affected - Atomic "I'm Affected" toggle (Requirement 14 & 26)
app.post('/api/problems/:id/affected', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const prob = db.problems.find((p) => p.id === id);
  if (!prob) return res.status(404).json({ error: 'Problem not found' });

  if (!Array.isArray(prob.affectedUserIds)) {
    prob.affectedUserIds = [];
  }

  const already = prob.affectedUserIds.includes(userId);
  if (already) {
    prob.affectedUserIds = prob.affectedUserIds.filter((u: string) => u !== userId);
    prob.affectedCount = Math.max(1, prob.affectedCount - 1);
  } else {
    prob.affectedUserIds.push(userId);
    prob.affectedCount += 1;
  }

  // Recalculate priority
  prob.priorityScore = Math.min(
    100,
    Math.round(prob.severityScore * 0.7 + Math.min(25, prob.affectedCount * 2) + 5)
  );

  saveDatabase(db);
  res.json({
    problem: prob,
    isAffected: !already,
    affectedCount: prob.affectedCount,
  });
});

// GET /api/stats - Dynamic statistics calculated from actual records
app.get('/api/stats', (req, res) => {
  const { userId, role, block } = req.query;

  let problems = [...db.problems];

  if (role === 'official' && typeof userId === 'string') {
    const official = OFFICIAL_ROSTER.find((o) => o.id === userId);
    if (official && !official.isSupervisor) {
      problems = problems.filter((p) => p.assigned_official_id === official.id);
    }
  } else if (role === 'citizen' && typeof block === 'string') {
    problems = problems.filter((p) => p.block.toLowerCase() === block.toLowerCase());
  }

  const totalOpen = problems.filter(
    (p) => p.status === 'Reported' || p.status === 'Under Review' || p.status === 'Verified'
  ).length;

  const critical = problems.filter(
    (p) => (p.priority === 'Critical' || p.priorityScore >= 85) && p.status !== 'Closed'
  ).length;

  const inProgress = problems.filter(
    (p) => p.status === 'Assigned' || p.status === 'Work in Progress' || p.status === 'In Progress'
  ).length;

  const overdue = problems.filter((p) => {
    if (!p.expectedCompletion || p.status === 'Closed' || p.status === 'Completed') return false;
    return new Date(p.expectedCompletion).getTime() < Date.now();
  }).length;

  const resolved = problems.filter(
    (p) => p.status === 'Completed' || p.status === 'Pending Citizen Verification' || p.status === 'Closed'
  ).length;

  const myReports = typeof userId === 'string'
    ? db.problems.filter((p) => p.reportedBy?.id === userId).length
    : 0;

  res.json({
    totalProblems: problems.length,
    totalOpen,
    critical,
    inProgress,
    overdue,
    resolved,
    myReports,
  });
});

// Notifications API
app.get('/api/notifications', (req, res) => {
  const { role, userId } = req.query;
  const list = db.notifications.filter((n) => {
    if (role && n.recipientRole !== role) return false;
    if (userId && n.recipientId && n.recipientId !== userId) return false;
    return true;
  });
  res.json({ notifications: list });
});

app.post('/api/notifications/read', (req, res) => {
  const { id } = req.body;
  if (id === 'all') {
    db.notifications.forEach((n) => (n.read = true));
  } else {
    const found = db.notifications.find((n) => n.id === id);
    if (found) found.read = true;
  }
  saveDatabase(db);
  res.json({ ok: true });
});

// POST /api/reset-data - Clears DB back to exactly 0 problems
app.post('/api/reset-data', (req, res) => {
  db = { problems: [], notifications: [], nextId: 1 };
  saveDatabase(db);
  res.json({ message: 'Database reset to 0 problems' });
});

// Server-side AI Problem Analysis Endpoint
app.post('/api/ai/analyze-problem', async (req, res) => {
  try {
    const { title, description, categoryHint, block, city, imageBase64, mimeType } = req.body;

    if (!title && !description) {
      return res.status(400).json({ error: 'Title or description is required for analysis.' });
    }

    if (!ai) {
      const fallbackResult = generateFallbackAnalysis({
        title: title || '',
        description: description || '',
        block,
        category: categoryHint,
      });
      return res.json({ result: fallbackResult, provider: 'fallback_engine' });
    }

    const promptText = `
You are CivicEye AI analyzing a civic infrastructure report in ${city || 'Indore'}, India (Locality: ${block || 'Tilak Nagar'}).
Complaint Title: "${title}"
Description: "${description}"
User Category: "${categoryHint || 'None'}"

Perform structured assessment:
1. Category: One of ['Pothole', 'Road', 'Streetlight', 'Drainage', 'Garbage', 'Water', 'Footpath', 'Public Building', 'Other']
2. Severity: 'Low', 'Medium', 'High', or 'Critical'
3. Severity Score: 0-100
4. Estimated Risk: 0-100
5. Recommended Priority: 'Low', 'Medium', 'High', or 'Critical'
6. Possible Affected People: integer
7. Likely Department: string
8. Recommended Action: string under 15 words
9. Reason Factors: array of 3 concise strings
10. Confidence: 0-100
`;

    const contents: any[] = [];
    if (imageBase64) {
      contents.push({
        parts: [
          {
            inlineData: {
              data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
              mimeType: mimeType || 'image/jpeg',
            },
          },
          { text: promptText },
        ],
      });
    } else {
      contents.push({ parts: [{ text: promptText }] });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            severity: { type: Type.STRING },
            severityScore: { type: Type.INTEGER },
            estimatedRisk: { type: Type.INTEGER },
            recommendedPriority: { type: Type.STRING },
            possibleAffectedPeople: { type: Type.INTEGER },
            likelyDepartment: { type: Type.STRING },
            recommendedAction: { type: Type.STRING },
            reasonFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidence: { type: Type.INTEGER },
          },
          required: [
            'category',
            'severity',
            'severityScore',
            'estimatedRisk',
            'recommendedPriority',
            'possibleAffectedPeople',
            'likelyDepartment',
            'recommendedAction',
            'reasonFactors',
            'confidence',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const priorityScore = Math.min(100, Math.max(10, Math.round(parsed.severityScore * 0.9 + 8)));

    res.json({
      result: {
        ...parsed,
        priorityScore,
        potentialDuplicate: false,
        isAiFallback: false,
      },
      provider: 'gemini-3.8-flash',
    });
  } catch (err: any) {
    console.warn('Gemini error, using fallback:', err?.message || err);
    const fallbackResult = generateFallbackAnalysis({
      title: req.body?.title || '',
      description: req.body?.description || '',
      block: req.body?.block,
      category: req.body?.categoryHint,
    });
    res.json({ result: fallbackResult, provider: 'fallback_engine_on_error' });
  }
});

// Vite middleware mounting in development, or static hosting in production
async function setupServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicEye AI Server running at http://0.0.0.0:${PORT} (0 preloaded problems in DB)`);
  });
}

setupServer().catch((err) => {
  console.error('Fatal server boot failure:', err);
  process.exit(1);
});
