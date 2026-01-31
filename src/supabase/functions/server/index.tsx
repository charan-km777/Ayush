import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase client with service role for admin operations
const getAdminClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

// Helper function to verify user from access token
async function verifyUser(accessToken: string | undefined) {
  if (!accessToken) {
    console.log('❌ No access token provided');
    return null;
  }

  try {
    console.log(`🔍 Attempting to verify token (length: ${accessToken.length}, first 30 chars): ${accessToken.substring(0, 30)}...`);
    console.log(`🔑 Using SUPABASE_URL: ${Deno.env.get('SUPABASE_URL')}`);
    console.log(`🔑 SERVICE_ROLE_KEY exists: ${!!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`);
    console.log(`🔑 ANON_KEY exists: ${!!Deno.env.get('SUPABASE_ANON_KEY')}`);
    
    // Create a client with anon key and set the auth token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    );
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log(`❌ Token verification error:`, {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      return null;
    }
    
    if (!user) {
      console.log('❌ No user found for token');
      return null;
    }
    
    console.log(`✅ User verified successfully:`, {
      id: user.id,
      email: user.email,
      aud: user.aud,
      role: user.role,
    });
    return user;
  } catch (error) {
    console.log(`❌ Exception during user verification:`, error);
    if (error instanceof Error) {
      console.log(`Error details: ${error.message}`, error.stack);
    }
    return null;
  }
}

// Health check endpoint
app.get("/make-server-8b756e70/health", (c) => {
  const envCheck = {
    hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
    supabaseUrl: Deno.env.get('SUPABASE_URL'),
    hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    hasAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
  };
  console.log('Health check - Environment:', envCheck);
  return c.json({ status: "ok", env: envCheck });
});

// Debug endpoint to test token validation
app.get("/make-server-8b756e70/debug-token", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    
    console.log('Debug token request:', {
      hasAuthHeader: !!authHeader,
      authHeaderStart: authHeader?.substring(0, 30),
      hasToken: !!accessToken,
      tokenStart: accessToken?.substring(0, 20)
    });
    
    const user = await verifyUser(accessToken);
    
    return c.json({ 
      success: !!user,
      userId: user?.id,
      userEmail: user?.email,
      hasToken: !!accessToken
    });
  } catch (error) {
    console.log(`Debug token error: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Sign up endpoint
app.post("/make-server-8b756e70/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }
    
    const supabase = getAdminClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }
    
    // Initialize user profile in KV store
    const userId = data.user.id;
    await kv.set(`user:${userId}:profile`, {
      id: userId,
      email,
      name,
      createdAt: new Date().toISOString()
    });
    
    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: "Failed to create user" }, 500);
  }
});

// Get user profile
app.get("/make-server-8b756e70/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const user = await verifyUser(accessToken);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const profile = await kv.get(`user:${user.id}:profile`);
    return c.json({ profile });
  } catch (error) {
    console.log(`Get profile error: ${error}`);
    return c.json({ error: "Failed to get profile" }, 500);
  }
});

// Save dosha assessment
app.post("/make-server-8b756e70/dosha-assessment", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const user = await verifyUser(accessToken);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const assessment = await c.req.json();
    const timestamp = new Date().toISOString();
    
    // Save the assessment
    await kv.set(`user:${user.id}:dosha:latest`, {
      ...assessment,
      timestamp
    });
    
    // Save to history
    const historyKey = `user:${user.id}:dosha:history:${timestamp}`;
    await kv.set(historyKey, {
      ...assessment,
      timestamp
    });
    
    return c.json({ success: true, assessment, timestamp });
  } catch (error) {
    console.log(`Save dosha assessment error: ${error}`);
    return c.json({ error: "Failed to save assessment" }, 500);
  }
});

// Get latest dosha assessment
app.get("/make-server-8b756e70/dosha-assessment", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const user = await verifyUser(accessToken);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const assessment = await kv.get(`user:${user.id}:dosha:latest`);
    return c.json({ assessment });
  } catch (error) {
    console.log(`Get dosha assessment error: ${error}`);
    return c.json({ error: "Failed to get assessment" }, 500);
  }
});

// Save health assessment
app.post("/make-server-8b756e70/health-assessment", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const user = await verifyUser(accessToken);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const assessment = await c.req.json();
    const timestamp = new Date().toISOString();
    
    // Save the assessment
    await kv.set(`user:${user.id}:health:latest`, {
      ...assessment,
      timestamp
    });
    
    // Save to history
    const historyKey = `user:${user.id}:health:history:${timestamp}`;
    await kv.set(historyKey, {
      ...assessment,
      timestamp
    });
    
    return c.json({ success: true, assessment, timestamp });
  } catch (error) {
    console.log(`Save health assessment error: ${error}`);
    return c.json({ error: "Failed to save assessment" }, 500);
  }
});

// Get latest health assessment
app.get("/make-server-8b756e70/health-assessment", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const user = await verifyUser(accessToken);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const assessment = await kv.get(`user:${user.id}:health:latest`);
    return c.json({ assessment });
  } catch (error) {
    console.log(`Get health assessment error: ${error}`);
    return c.json({ error: "Failed to get assessment" }, 500);
  }
});

// Get assessment history
app.get("/make-server-8b756e70/history/:type", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const user = await verifyUser(accessToken);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const type = c.req.param('type'); // 'dosha' or 'health'
    const prefix = `user:${user.id}:${type}:history:`;
    const history = await kv.getByPrefix(prefix);
    
    // Sort by timestamp descending
    const sortedHistory = history.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return c.json({ history: sortedHistory });
  } catch (error) {
    console.log(`Get history error: ${error}`);
    return c.json({ error: "Failed to get history" }, 500);
  }
});

// Save disease predictions
app.post("/make-server-8b756e70/predictions", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const user = await verifyUser(accessToken);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const predictions = await c.req.json();
    const timestamp = new Date().toISOString();
    
    // Save predictions
    await kv.set(`user:${user.id}:predictions:latest`, {
      ...predictions,
      timestamp
    });
    
    // Save to history
    const historyKey = `user:${user.id}:predictions:history:${timestamp}`;
    await kv.set(historyKey, {
      ...predictions,
      timestamp
    });
    
    return c.json({ success: true, predictions, timestamp });
  } catch (error) {
    console.log(`Save predictions error: ${error}`);
    return c.json({ error: "Failed to save predictions" }, 500);
  }
});

// Get latest predictions
app.get("/make-server-8b756e70/predictions", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const user = await verifyUser(accessToken);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const predictions = await kv.get(`user:${user.id}:predictions:latest`);
    return c.json({ predictions });
  } catch (error) {
    console.log(`Get predictions error: ${error}`);
    return c.json({ error: "Failed to get predictions" }, 500);
  }
});

// Save lifestyle data
app.post("/make-server-8b756e70/lifestyle", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const user = await verifyUser(accessToken);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const lifestyle = await c.req.json();
    const timestamp = new Date().toISOString();
    
    // Save lifestyle data
    await kv.set(`user:${user.id}:lifestyle:latest`, {
      ...lifestyle,
      timestamp
    });
    
    return c.json({ success: true, lifestyle, timestamp });
  } catch (error) {
    console.log(`Save lifestyle error: ${error}`);
    return c.json({ error: "Failed to save lifestyle data" }, 500);
  }
});

// Get lifestyle data
app.get("/make-server-8b756e70/lifestyle", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const user = await verifyUser(accessToken);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const lifestyle = await kv.get(`user:${user.id}:lifestyle:latest`);
    return c.json({ lifestyle });
  } catch (error) {
    console.log(`Get lifestyle error: ${error}`);
    return c.json({ error: "Failed to get lifestyle data" }, 500);
  }
});

// Get nearby AYUSH doctors based on location and health profile
app.post("/make-server-8b756e70/nearby-doctors", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const user = await verifyUser(accessToken);
    
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { location, doshaProfile, conditions } = await c.req.json();
    
    console.log(`Finding doctors for user ${user.id}, dosha: ${doshaProfile}, location:`, location);

    // Generate sample doctors based on dosha profile and conditions
    // In production, this would query Google Places API or similar
    const doctors = generateDoctorRecommendations(doshaProfile, conditions, location);
    
    return c.json({ doctors });
  } catch (error) {
    console.log(`Get nearby doctors error: ${error}`);
    return c.json({ error: "Failed to get doctor recommendations" }, 500);
  }
});

// Helper function to generate doctor recommendations
function generateDoctorRecommendations(
  doshaProfile: string,
  conditions: string[],
  location: { lat: number; lng: number } | null
) {
  const doctors = [
    {
      name: 'Dr. Priya Sharma',
      specialty: 'Ayurvedic Medicine',
      ayushFocus: 'Panchakarma & Dosha Balancing',
      rating: 4.8,
      distance: location ? '1.2 km' : 'Location not available',
      address: '123 Wellness Center, Green Park',
      phone: '+91-9876543210',
      availability: 'Mon-Sat, 9 AM - 6 PM',
      consultationFee: '₹800'
    },
    {
      name: 'Dr. Rajesh Kumar',
      specialty: 'Yoga Therapy',
      ayushFocus: 'Stress Management & Pranayama',
      rating: 4.9,
      distance: location ? '2.5 km' : 'Location not available',
      address: '456 Holistic Health Clinic, Central Avenue',
      phone: '+91-9876543211',
      availability: 'Mon-Fri, 10 AM - 7 PM',
      consultationFee: '₹1000'
    },
    {
      name: 'Dr. Meera Patel',
      specialty: 'Naturopathy',
      ayushFocus: 'Diet & Lifestyle Counseling',
      rating: 4.7,
      distance: location ? '3.0 km' : 'Location not available',
      address: '789 Nature Cure Center, Herbal Lane',
      phone: '+91-9876543212',
      availability: 'Tue-Sun, 8 AM - 5 PM',
      consultationFee: '₹700'
    },
    {
      name: 'Dr. Anand Iyer',
      specialty: 'Unani Medicine',
      ayushFocus: 'Metabolic & Digestive Disorders',
      rating: 4.6,
      distance: location ? '4.2 km' : 'Location not available',
      address: '321 Unani Clinic, Heritage Road',
      phone: '+91-9876543213',
      availability: 'Mon-Sat, 10 AM - 8 PM',
      consultationFee: '₹900'
    },
    {
      name: 'Dr. Lakshmi Reddy',
      specialty: 'Siddha Medicine',
      ayushFocus: 'Chronic Disease Management',
      rating: 4.9,
      distance: location ? '2.8 km' : 'Location not available',
      address: '567 Siddha Healthcare, Temple Street',
      phone: '+91-9876543214',
      availability: 'Mon-Fri, 9 AM - 6 PM',
      consultationFee: '₹850'
    },
    {
      name: 'Dr. Vikram Singh',
      specialty: 'Homeopathy',
      ayushFocus: 'Allergy & Immunity',
      rating: 4.8,
      distance: location ? '1.8 km' : 'Location not available',
      address: '890 Homeopathic Center, Garden Plaza',
      phone: '+91-9876543215',
      availability: 'Tue-Sun, 11 AM - 7 PM',
      consultationFee: '₹600'
    },
    // Add general hospitals and doctors as fallback
    {
      name: 'City General Hospital',
      specialty: 'Multi-Specialty Hospital',
      ayushFocus: 'Integrated Medicine (AYUSH + Modern)',
      rating: 4.5,
      distance: location ? '3.5 km' : 'Location not available',
      address: '111 Main Road, City Center',
      phone: '+91-9876543216',
      availability: '24/7 Emergency & OPD: 8 AM - 8 PM',
      consultationFee: '₹500 (General), ₹1500 (Specialist)'
    },
    {
      name: 'Dr. Amit Malhotra, MD',
      specialty: 'General Physician',
      ayushFocus: 'Preventive Healthcare & Wellness',
      rating: 4.7,
      distance: location ? '2.2 km' : 'Location not available',
      address: '222 Medical Plaza, Downtown',
      phone: '+91-9876543217',
      availability: 'Mon-Sat, 9 AM - 9 PM',
      consultationFee: '₹800'
    },
    {
      name: 'Wellness Integrated Clinic',
      specialty: 'Integrative Medicine',
      ayushFocus: 'AYUSH + Allopathy Combined Care',
      rating: 4.6,
      distance: location ? '4.0 km' : 'Location not available',
      address: '333 Health Boulevard, Sector 5',
      phone: '+91-9876543218',
      availability: 'Mon-Sun, 8 AM - 10 PM',
      consultationFee: '₹1200'
    }
  ];

  // Customize based on dosha and conditions
  if (doshaProfile === 'Vata') {
    doctors[0].ayushFocus = 'Vata Balancing & Anxiety Management';
  } else if (doshaProfile === 'Pitta') {
    doctors[0].ayushFocus = 'Pitta Cooling & Inflammation Control';
  } else if (doshaProfile === 'Kapha') {
    doctors[0].ayushFocus = 'Kapha Stimulation & Weight Management';
  }

  return doctors;
}

Deno.serve(app.fetch);