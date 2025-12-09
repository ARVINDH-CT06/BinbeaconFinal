import type { Express } from "express";
import { createServer, type Server } from "http";

import { User } from "./models/User";
import { House } from "./models/House";
import { OverflowReport } from "./models/OverflowReport";
import { Feedback } from "./models/Feedback";
import { Tip } from "./models/Tip";
import { Broadcast } from "./models/Broadcast";
import { Chat } from "./models/Chat";

export async function registerRoutes(app: Express): Promise<Server> {
  /* ----------------------------------------------------------------
   * AUTH: REGISTER
   * ---------------------------------------------------------------- */
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { user: userData, profile: profileData } = req.body;

      if (!userData || !userData.phone || !userData.password || !userData.role) {
        return res.status(400).json({ message: "Missing required user fields" });
      }

      const existing = await User.findOne({ phone: userData.phone });
      if (existing) {
        return res.status(400).json({ message: "Phone number already registered" });
      }

      // Default Delhi coordinates [lng, lat]
      const delhiCoordinates: [number, number] = [77.209, 28.6139];

      // If resident, create a House with safe defaults + Delhi location
      let house: any = null;
      if (userData.role === "resident") {
        house = await House.create({
          wardNumber: profileData?.wardNumber || "WARD-1",
          houseNumber: profileData?.doorNumber || "UNKNOWN",
          houseId: profileData?.houseId || `WARD-${Date.now()}`,
          address: profileData?.address || "Residence - Delhi",
          location: {
            type: "Point",
            coordinates:
              profileData?.coordinates?.length === 2
                ? profileData.coordinates
                : delhiCoordinates,
          },
        });
      }

      // Create the user linked to house (if any)
      const user = await User.create({
        name: userData.name || profileData?.authorityName || "User",
        phone: userData.phone,
        password: userData.password, // plain for prototype
        role: userData.role,
        house: house?._id ?? null,
      });

      // Build profile response sent to frontend
      let profile: any = null;

      if (user.role === "resident") {
        profile = {
          id: user._id.toString(),
          doorNumber: house?.houseNumber || "",
          address: house?.address || "",
          beaconScore: 80,
          isAvailable: true,
          coordinates: house?.location.coordinates,
        };
      } else if (user.role === "collector") {
        profile = {
          id: user._id.toString(),
          employeeId: profileData?.employeeId || "",
          areaAssigned: profileData?.areaAssigned || "",
          collectionProgress: 0,
        };
      } else if (user.role === "authority") {
        profile = {
          id: user._id.toString(),
          authorityName: profileData?.authorityName || user.name,
          employeeId: profileData?.employeeId || "",
          email: profileData?.email || "",
        };
      }

      return res.status(201).json({ user, profile });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  /* ----------------------------------------------------------------
   * AUTH: LOGIN
   * ---------------------------------------------------------------- */
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({ message: "Phone and password are required" });
      }

      const user: any = await User.findOne({ phone }).populate("house");
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      let profile: any = null;

      if (user.role === "resident") {
        profile = {
          id: user._id.toString(),
          doorNumber: user.house ? (user.house as any).houseNumber : "",
          address: user.house ? (user.house as any).address : "",
          beaconScore: 80,
          isAvailable: true,
        };
      } else if (user.role === "collector") {
        profile = {
          id: user._id.toString(),
          employeeId: "GC-DEMO",
          areaAssigned: "Default Area",
          collectionProgress: 0,
        };
      } else if (user.role === "authority") {
        profile = {
          id: user._id.toString(),
          authorityName: user.name,
          employeeId: "AUTH-DEMO",
          email: "authority@example.com",
        };
      }

      return res.json({ user, profile });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Login failed" });
    }
  });

  /* ----------------------------------------------------------------
   * RESIDENT: STATUS TOGGLE (Available / Not Available)
   *  - matches frontend: POST /api/residents/:id/status
   * ---------------------------------------------------------------- */
  app.post("/api/residents/:id/status", async (req, res) => {
    try {
      const { isAvailable } = req.body;

      if (typeof isAvailable !== "boolean") {
        return res
          .status(400)
          .json({ message: "isAvailable (boolean) is required" });
      }

      // For prototype: just acknowledge. (Later we can link to House.)
      return res.json({ success: true, isAvailable });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to update status" });
    }
  });

  /* ----------------------------------------------------------------
   * RESIDENT: HISTORY
   *  - used by ResidentDashboard -> /api/residents/:id/history
   * ---------------------------------------------------------------- */
  app.get("/api/residents/:id/history", async (req, res) => {
    try {
      const history = await OverflowReport.find({ resident: req.params.id })
        .populate("house")
        .sort({ createdAt: -1 });

      return res.json(history);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  /* ----------------------------------------------------------------
   * OVERFLOW: CREATE REPORT (NEW SHAPE used by React)
   *  - POST /api/overflow-reports
   *  - body: { residentId, overflowType, location:{lat,lng}, remarks? }
   * ---------------------------------------------------------------- */
  app.post("/api/overflow-reports", async (req, res) => {
    try {
      const { residentId, overflowType, location, remarks } = req.body;

      if (!residentId || !overflowType || !location || !location.lat || !location.lng) {
        return res.status(400).json({ message: "Missing fields" });
      }

      const report = await OverflowReport.create({
        resident: residentId,
        overflowType,
        location: {
          type: "Point",
          coordinates: [location.lng, location.lat],
        },
        remarks,
        status: "pending",
        createdAt: new Date(),
      } as any);

      return res.json({ success: true, report });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to submit report" });
    }
  });

  /* ----------------------------------------------------------------
   * OVERFLOW: LEGACY ALIAS
   *  - older code used POST /api/overflow with {lat, lng}
   * ---------------------------------------------------------------- */
  app.post("/api/overflow", async (req, res) => {
    try {
      const { residentId, overflowType, lat, lng } = req.body;

      if (!residentId || !overflowType || !lat || !lng) {
        return res.status(400).json({ message: "Missing fields" });
      }

      const report = await OverflowReport.create({
        resident: residentId,
        overflowType,
        location: {
          type: "Point",
          coordinates: [lng, lat],
        },
        status: "pending",
        createdAt: new Date(),
      } as any);

      return res.json({ success: true, report });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to submit report" });
    }
  });

  /* ----------------------------------------------------------------
   * OVERFLOW: RESOLVE
   *  - used by Collector Alerts: PATCH /api/overflow-reports/:id
   * ---------------------------------------------------------------- */
  app.patch("/api/overflow-reports/:id", async (req, res) => {
    try {
      const report = await OverflowReport.findByIdAndUpdate(
        req.params.id,
        { status: "resolved" },
        { new: true }
      );

      return res.json({ success: true, report });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to resolve report" });
    }
  });

  /* ----------------------------------------------------------------
   * OVERFLOW: LIST ALL
   *  - used by Collector Alerts: GET /api/overflow-reports
   *  - frontend expects: { success: true, reports: [...] }
   * ---------------------------------------------------------------- */
  app.get("/api/overflow-reports", async (_req, res) => {
    try {
      const reports = await OverflowReport.find()
        .populate("resident", "name phone")
        .sort({ createdAt: -1 });

      return res.json({ success: true, reports });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch reports" });
    }
  });

  /* ----------------------------------------------------------------
   * COLLECTOR: HOUSES (placeholder for future)
   * ---------------------------------------------------------------- */
  app.get("/api/collector/houses", async (_req, res) => {
    try {
      const houses = await House.find().populate("householder");
      return res.json({ success: true, houses });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch houses" });
    }
  });

  app.post("/api/collector/collection-complete", async (req, res) => {
    try {
      const { houseId } = req.body;
      if (!houseId) {
        return res.status(400).json({ message: "Missing houseId" });
      }

      // In full version this would update history & house status
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to update" });
    }
  });

  app.post("/api/collector/report-house", async (req, res) => {
    try {
      const { houseId, reason } = req.body;
      if (!houseId || !reason) {
        return res.status(400).json({ message: "Missing fields" });
      }

      // Later: store violation, reduce Beacon Score, etc.
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to submit report" });
    }
  });

  /* ----------------------------------------------------------------
   * FEEDBACK
   * ---------------------------------------------------------------- */
  app.post("/api/feedback", async (req, res) => {
    try {
      const { residentId, message, rating } = req.body;

      if (!residentId || !message || !rating) {
        return res.status(400).json({ message: "Missing fields" });
      }

      const feedback = await Feedback.create({
        resident: residentId,
        message,
        rating,
      });

      return res
        .status(201)
        .json({ message: "Feedback submitted", feedback });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  app.get("/api/feedback", async (_req, res) => {
    try {
      const feedbackList = await Feedback.find()
        .populate("resident")
        .sort({ createdAt: -1 });

      return res.json(feedbackList);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  /* ----------------------------------------------------------------
   * TIPS
   *  (same behavior as your original file)
   * ---------------------------------------------------------------- */
  app.post("/api/tips", async (req, res) => {
    try {
      const { fromResident, toCollector, amount, message } = req.body;

      if (!fromResident || !toCollector || !amount) {
        return res.status(400).json({ message: "Missing fields" });
      }

      const tip = await Tip.create({
        fromResident,
        toCollector,
        amount,
        message,
      });

      return res
        .status(201)
        .json({ message: "Tip sent successfully", tip });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to send tip" });
    }
  });

  app.get("/api/tips/collector/:collectorId", async (req, res) => {
    try {
      const tips = await Tip.find({ toCollector: req.params.collectorId })
        .populate("fromResident")
        .sort({ createdAt: -1 });

      return res.json(tips);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch earnings" });
    }
  });

  /* ----------------------------------------------------------------
   * BROADCAST
   * ---------------------------------------------------------------- */
  app.post("/api/broadcasts", async (req, res) => {
    try {
      const { authorityId, message } = req.body;

      if (!authorityId || !message) {
        return res.status(400).json({ message: "Missing fields" });
      }

      const broadcast = await Broadcast.create({
        authority: authorityId,
        message,
      });

      return res
        .status(201)
        .json({ message: "Broadcast sent successfully", broadcast });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to send broadcast" });
    }
  });

  app.get("/api/broadcasts", async (_req, res) => {
    try {
      const broadcasts = await Broadcast.find()
        .populate("authority")
        .sort({ createdAt: -1 });

      return res.json(broadcasts);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch broadcasts" });
    }
  });

  /* ----------------------------------------------------------------
   * CHAT
   * ---------------------------------------------------------------- */
  app.post("/api/chats", async (req, res) => {
    try {
      const { sender, receiver, group, message } = req.body;

      if (!sender || !message) {
        return res.status(400).json({ message: "Missing fields" });
      }

      const chat = await Chat.create({
        sender,
        receiver: receiver || null,
        group: group || null,
        message,
      });

      return res.status(201).json({ message: "Message sent", chat });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/chats/private/:user1/:user2", async (req, res) => {
    try {
      const { user1, user2 } = req.params;

      const chats = await Chat.find({
        $or: [
          { sender: user1, receiver: user2 },
          { sender: user2, receiver: user1 },
        ],
      })
        .populate("sender")
        .populate("receiver")
        .sort({ createdAt: 1 });

      return res.json(chats);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch chat" });
    }
  });

  app.get("/api/chats/group/:groupName", async (req, res) => {
    try {
      const chats = await Chat.find({ group: req.params.groupName })
        .populate("sender")
        .sort({ createdAt: 1 });

      return res.json(chats);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch group chat" });
    }
  });

  /* ----------------------------------------------------------------
   * HTTP SERVER WRAP
   * ---------------------------------------------------------------- */
  const httpServer = createServer(app);
  return httpServer;
}
