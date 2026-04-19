import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import SuperAdminLayout from "@/components/layout/SuperAdminLayout";
import RequireAuth from "@/components/auth/RequireAuth";
import RequireSuperAdmin from "@/components/auth/RequireSuperAdmin";
import Dashboard from "./pages/Dashboard";
import Inbox from "./pages/Inbox";
import Contacts from "./pages/Contacts";
import Campaigns from "./pages/Campaigns";
import Settings from "./pages/Settings";
import WhatsAppConnection from "./pages/settings/WhatsAppConnection";
import Templates from "./pages/settings/Templates";
import SuperAdminOverview from "./pages/admin/SuperAdminOverview";
import SuperAdminInbox from "./pages/admin/SuperAdminInbox";
import SuperAdminCampaigns from "./pages/admin/SuperAdminCampaigns";
import SuperAdminWhatsApp from "./pages/admin/SuperAdminWhatsApp";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Client portal — no admin access here */}
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/whatsapp" element={<WhatsAppConnection />} />
            <Route path="/settings/templates" element={<Templates />} />
          </Route>

          {/* Super Admin — strictly separated */}
          <Route element={<RequireSuperAdmin><SuperAdminLayout /></RequireSuperAdmin>}>
            <Route path="/admin" element={<SuperAdminOverview />} />
            <Route path="/admin/inbox" element={<SuperAdminInbox />} />
            <Route path="/admin/campaigns" element={<SuperAdminCampaigns />} />
            <Route path="/admin/whatsapp" element={<SuperAdminWhatsApp />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
