"use client";

import { useState, useEffect } from "react";
import {
  PiPaperPlaneTilt,
  PiUserPlus,
  PiCopy,
  PiCheck,
  PiTrash,
  PiLightning,
  PiArrowClockwise,
  PiShieldCheck,
  PiInfo,
  PiX,
  PiCheckCircleFill,
  PiUsers,
  PiLockKey,
} from "react-icons/pi";
import toast from "react-hot-toast";
import {
  serverGetTelegramAdmins,
  serverAddTelegramAdmin,
  serverRemoveTelegramAdmin,
  serverSendTestPingToAdmin,
  serverSyncTelegramWebhook,
} from "@/app/actions/admin";

export default function TelegramAdminManager() {
  const [admins, setAdmins] = useState([]);
  const [botInfo, setBotInfo] = useState({ username: "KalFurnitureAdminBot", firstName: "Kal Furniture Admin" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pingingId, setPingingId] = useState(null);
  const [revokingId, setRevokingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Form states
  const [formTelegramId, setFormTelegramId] = useState("");
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("Showroom Manager");
  const [formSendWelcome, setFormSendWelcome] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadAdmins = async () => {
    setIsLoading(true);
    try {
      const res = await serverGetTelegramAdmins();
      if (res && res.success) {
        setAdmins(res.admins || []);
        if (res.botInfo) setBotInfo(res.botInfo);
      } else {
        toast.error(res?.error || "Failed to load Telegram admins");
      }
    } catch (err) {
      toast.error(err.message || "Network error loading admins");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    toast.success(`Copied ID: ${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendPing = async (telegramId, name) => {
    setPingingId(telegramId);
    try {
      const res = await serverSendTestPingToAdmin(telegramId);
      if (res && res.success) {
        toast.success(`Ping delivered to ${name || telegramId}!`, { icon: "⚡" });
      } else {
        toast.error(res?.error || "Failed to deliver ping. Did the user /start the bot?");
      }
    } catch (err) {
      toast.error(err.message || "Failed to send ping");
    } finally {
      setPingingId(null);
    }
  };

  const handleRevokeAdmin = async (telegramId, name) => {
    if (!confirm(`Are you sure you want to revoke admin privileges for "${name || telegramId}"?`)) {
      return;
    }

    setRevokingId(telegramId);
    try {
      const res = await serverRemoveTelegramAdmin(telegramId);
      if (res && res.success) {
        toast.success(`Revoked access for ${name || telegramId}`);
        setAdmins((prev) => prev.filter((a) => a.telegramId !== telegramId));
      } else {
        toast.error(res?.error || "Failed to revoke admin");
      }
    } catch (err) {
      toast.error(err.message || "Error revoking admin");
    } finally {
      setRevokingId(null);
    }
  };

  const handleSyncWebhook = async () => {
    setIsSyncing(true);
    try {
      const res = await serverSyncTelegramWebhook();
      if (res && res.success) {
        toast.success("Telegram Webhook & Menu Button synced successfully!");
      } else {
        toast.error(res?.error || "Failed to sync webhook");
      }
    } catch (err) {
      toast.error(err.message || "Error syncing webhook");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const cleanId = formTelegramId.trim();
    if (!cleanId) {
      setFormError("Telegram User ID is required.");
      return;
    }
    if (!/^-?\d+$/.test(cleanId)) {
      setFormError("Telegram ID must be numeric (e.g. 6305668197).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await serverAddTelegramAdmin({
        telegramId: cleanId,
        name: formName.trim() || "Staff Admin",
        role: formRole.trim() || "Admin",
        sendWelcome: formSendWelcome,
      });

      if (res && res.success) {
        toast.success(res.message || "Admin authorized successfully!");
        setIsModalOpen(false);
        setFormTelegramId("");
        setFormName("");
        setFormRole("Showroom Manager");
        setFormSendWelcome(true);
        loadAdmins();
      } else {
        setFormError(res?.error || "Failed to authorize admin.");
      }
    } catch (err) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header / Quick Actions ── */}
      <div className="bg-white border border-secondary/10 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-secondary text-[11px] font-bold uppercase tracking-[0.2em] text-secondary/50">
                Telegram Access Control Studio
              </span>
            </div>
            <h2 className="font-primary text-[26px] sm:text-[32px] text-secondary leading-tight">
              Authorized Bot <em className="text-gold not-italic font-semibold">Admins</em>
            </h2>
            <p className="font-secondary text-[13.5px] text-secondary/60 max-w-2xl mt-1 leading-relaxed">
              Authorize team members and showroom staff to manage products, update prices, toggle promo banners, and receive real-time order inquiries via{" "}
              <a
                href={`https://t.me/${botInfo.username || "KalFurnitureAdminBot"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold font-semibold hover:underline"
              >
                @{botInfo.username || "KalFurnitureAdminBot"}
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-dark text-primary font-secondary text-[11.5px] font-bold tracking-widest uppercase rounded-xl shadow-[0_4px_16px_rgba(217,182,110,0.3)] transition-all cursor-pointer active:scale-98"
            >
              <PiUserPlus size={17} />
              + Authorize Admin ID
            </button>
            <button
              onClick={handleSyncWebhook}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-secondary/20 hover:border-gold text-secondary font-secondary text-[11px] font-bold tracking-wider uppercase rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Ensure webhook is active on kalefurnitures.com"
            >
              <PiArrowClockwise size={15} className={isSyncing ? "animate-spin" : ""} />
              {isSyncing ? "Syncing..." : "Sync Webhook"}
            </button>
            <a
              href={`https://t.me/${botInfo.username || "KalFurnitureAdminBot"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-500/10 hover:bg-sky-500 text-sky-700 hover:text-white border border-sky-400/30 font-secondary text-[11px] font-bold tracking-wider uppercase rounded-xl transition-all"
            >
              <PiPaperPlaneTilt size={15} />
              Open Bot Chat
            </a>
          </div>
        </div>

        {/* ── Quick Bot Status Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-secondary/10">
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-[#FAF8F5] border border-secondary/10">
            <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center shrink-0">
              <PiUsers size={20} />
            </div>
            <div>
              <span className="font-secondary text-[10.5px] font-bold uppercase tracking-wider text-secondary/40 block">
                Total Authorized
              </span>
              <span className="font-primary text-[20px] font-semibold text-secondary">
                {isLoading ? "..." : `${admins.length} Admins`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-[#FAF8F5] border border-secondary/10">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-600 flex items-center justify-center shrink-0">
              <PiPaperPlaneTilt size={20} />
            </div>
            <div>
              <span className="font-secondary text-[10.5px] font-bold uppercase tracking-wider text-secondary/40 block">
                Telegram Bot
              </span>
              <span className="font-secondary text-[14px] font-bold text-secondary flex items-center gap-1.5">
                @{botInfo.username || "KalFurnitureAdminBot"}
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-[#FAF8F5] border border-secondary/10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
              <PiShieldCheck size={20} />
            </div>
            <div>
              <span className="font-secondary text-[10.5px] font-bold uppercase tracking-wider text-secondary/40 block">
                Access Security
              </span>
              <span className="font-secondary text-[13px] font-semibold text-emerald-700">
                Whitelist Enforced (Restricted)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Instructional Guide: How to Get a Telegram ID ── */}
      <div className="bg-gradient-to-r from-[#FAF8F5] to-white border border-secondary/10 rounded-2xl p-5 md:p-6 shadow-2xs">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-gold/20 text-gold-dark flex items-center justify-center shrink-0 mt-0.5">
            <PiInfo size={20} />
          </div>
          <div className="space-y-1.5 text-secondary">
            <h3 className="font-primary text-[17px] font-semibold text-secondary">
              How does a team member get their Telegram ID?
            </h3>
            <p className="font-secondary text-[13px] text-secondary/70 leading-relaxed">
              Every Telegram account has a unique numeric identifier (e.g. <code>6305668197</code>). To authorize a staff member:
            </p>
            <ol className="font-secondary text-[12.5px] text-secondary/80 list-decimal list-inside space-y-1 pt-1">
              <li>
                Ask them to open Telegram and search for{" "}
                <a
                  href="https://t.me/userinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-gold hover:underline"
                >
                  @userinfobot
                </a>
                .
              </li>
              <li>
                Tap <b>Start</b> — the bot will immediately reply with their numerical <b>Id</b> (e.g. <code>6305668197</code>).
              </li>
              <li>
                Click <b>+ Authorize Admin ID</b> above, enter their ID and Name, and tap <b>Authorize</b>.
              </li>
              <li>
                They can then open{" "}
                <a
                  href={`https://t.me/${botInfo.username || "KalFurnitureAdminBot"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-gold hover:underline"
                >
                  @{botInfo.username || "KalFurnitureAdminBot"}
                </a>{" "}
                and tap <code>/start</code> to access all administrative tools instantly.
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* ── Authorized Admins Table / List ── */}
      <div className="bg-white border border-secondary/10 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-primary text-[20px] md:text-[22px] text-secondary">
              Active Authorized Administrators ({admins.length})
            </h3>
            <p className="font-secondary text-[12.5px] text-secondary/50">
              Users listed below have permission to modify inventory, manage prices, and control promo banners.
            </p>
          </div>
          <button
            onClick={loadAdmins}
            className="p-2 text-secondary/50 hover:text-gold hover:bg-gold/10 rounded-xl transition-colors cursor-pointer"
            title="Refresh list"
          >
            <PiArrowClockwise size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-secondary/40 font-secondary text-[13px]">
            <span className="w-5 h-5 border-2 border-gold/50 border-t-gold rounded-full animate-spin" />
            Loading authorized administrator roster...
          </div>
        ) : admins.length === 0 ? (
          <div className="py-16 text-center text-secondary/40 font-secondary text-[14px]">
            No authorized Telegram admins found. Add one above.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/5 border-b border-secondary/10 font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary/50">
                    <th className="py-3.5 px-6 font-medium">Administrator</th>
                    <th className="py-3.5 px-6 font-medium">Telegram User ID</th>
                    <th className="py-3.5 px-6 font-medium">Role & Scope</th>
                    <th className="py-3.5 px-6 font-medium">Status</th>
                    <th className="py-3.5 px-6 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/5">
                  {admins.map((admin) => (
                    <tr
                      key={admin.telegramId}
                      className="hover:bg-secondary/[0.02] transition-colors group"
                    >
                      {/* Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                              admin.isEnv
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-gold/15 text-gold-dark border border-gold/30"
                            }`}
                          >
                            {admin.name ? admin.name.charAt(0).toUpperCase() : "A"}
                          </div>
                          <div>
                            <span className="font-primary text-[16px] text-secondary font-medium block leading-tight">
                              {admin.name}
                            </span>
                            <span className="font-secondary text-[11px] text-secondary/45">
                              {admin.addedAt
                                ? typeof admin.addedAt === "string" && admin.addedAt.startsWith("20")
                                  ? new Date(admin.addedAt).toLocaleDateString()
                                  : admin.addedAt
                                : "Authorized"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Telegram ID */}
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-2 bg-[#FAF8F5] border border-secondary/15 px-3 py-1 rounded-lg">
                          <code className="font-mono text-[13px] text-secondary font-semibold">
                            {admin.telegramId}
                          </code>
                          <button
                            onClick={() => handleCopyId(admin.telegramId)}
                            className="text-secondary/40 hover:text-gold transition-colors cursor-pointer"
                            title="Copy Telegram ID"
                          >
                            {copiedId === admin.telegramId ? (
                              <PiCheck size={14} className="text-emerald-600" />
                            ) : (
                              <PiCopy size={14} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-secondary text-[11px] font-bold tracking-wide uppercase ${
                            admin.isEnv
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-gold/10 text-gold-dark border border-gold/25"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              admin.isEnv ? "bg-amber-600" : "bg-gold"
                            }`}
                          />
                          {admin.role || "Admin"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 font-secondary text-[12px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Authorized
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSendPing(admin.telegramId, admin.name)}
                            disabled={pingingId === admin.telegramId}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg font-secondary text-[11px] font-bold tracking-wider uppercase transition-colors cursor-pointer disabled:opacity-50"
                            title="Send instant connectivity test ping"
                          >
                            <PiLightning size={14} className={pingingId === admin.telegramId ? "animate-spin" : ""} />
                            {pingingId === admin.telegramId ? "Pinging..." : "Test Ping"}
                          </button>

                          {admin.isRemovable ? (
                            <button
                              onClick={() => handleRevokeAdmin(admin.telegramId, admin.name)}
                              disabled={revokingId === admin.telegramId}
                              className="p-1.5 text-secondary/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Revoke Admin Access"
                            >
                              <PiTrash size={17} />
                            </button>
                          ) : (
                            <span
                              className="p-1.5 text-secondary/20 cursor-not-allowed"
                              title="Primary environment admin (cannot be removed via panel)"
                            >
                              <PiLockKey size={16} />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col gap-3">
              {admins.map((admin) => (
                <div
                  key={admin.telegramId}
                  className="p-4 rounded-xl border border-secondary/10 bg-[#FAF8F5] space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                          admin.isEnv
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-gold/15 text-gold-dark border border-gold/30"
                        }`}
                      >
                        {admin.name ? admin.name.charAt(0).toUpperCase() : "A"}
                      </div>
                      <div>
                        <h4 className="font-primary text-[16px] text-secondary font-medium leading-tight">
                          {admin.name}
                        </h4>
                        <span className="font-secondary text-[11px] text-secondary/50">
                          {admin.role || "Admin"}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 font-secondary text-[10.5px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-secondary/10">
                    <div className="inline-flex items-center gap-1.5 font-mono text-[12px] text-secondary font-semibold">
                      <span>ID: {admin.telegramId}</span>
                      <button
                        onClick={() => handleCopyId(admin.telegramId)}
                        className="text-secondary/40 hover:text-gold"
                      >
                        {copiedId === admin.telegramId ? (
                          <PiCheck size={14} className="text-emerald-600" />
                        ) : (
                          <PiCopy size={14} />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSendPing(admin.telegramId, admin.name)}
                        disabled={pingingId === admin.telegramId}
                        className="px-2.5 py-1 bg-sky-50 text-sky-700 rounded-md font-secondary text-[11px] font-bold uppercase"
                      >
                        {pingingId === admin.telegramId ? "Pinging..." : "Ping"}
                      </button>
                      {admin.isRemovable && (
                        <button
                          onClick={() => handleRevokeAdmin(admin.telegramId, admin.name)}
                          disabled={revokingId === admin.telegramId}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <PiTrash size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Authorize New Admin Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-secondary/15 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-secondary/40 hover:text-secondary rounded-full hover:bg-secondary/5 transition-colors cursor-pointer"
            >
              <PiX size={20} />
            </button>

            <div className="mb-6">
              <span className="font-secondary text-[11px] font-bold tracking-[0.2em] uppercase text-gold block mb-1">
                Access Authorization
              </span>
              <h3 className="font-primary text-[24px] text-secondary leading-tight">
                Authorize Telegram <em className="text-gold not-italic font-semibold">Admin</em>
              </h3>
              <p className="font-secondary text-[13px] text-secondary/50 mt-1">
                Grant this user permission to control products and promo banners through @{botInfo.username || "KalFurnitureAdminBot"}.
              </p>
            </div>

            {formError && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-[12.5px] rounded-xl font-secondary">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block font-secondary text-[11.5px] font-bold uppercase tracking-wider text-secondary/70 mb-1.5">
                  Telegram User ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6305668197"
                  value={formTelegramId}
                  onChange={(e) => setFormTelegramId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-secondary/15 focus:border-gold rounded-xl font-mono text-[14px] text-secondary placeholder:text-secondary/30 focus:outline-hidden transition-colors"
                />
                <p className="font-secondary text-[11px] text-secondary/50 mt-1">
                  User can find this by sending <code>/start</code> to <b>@userinfobot</b> in Telegram.
                </p>
              </div>

              <div>
                <label className="block font-secondary text-[11.5px] font-bold uppercase tracking-wider text-secondary/70 mb-1.5">
                  Team Member Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dawit (Showroom Manager)"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-secondary/15 focus:border-gold rounded-xl font-secondary text-[14px] text-secondary placeholder:text-secondary/30 focus:outline-hidden transition-colors"
                />
              </div>

              <div>
                <label className="block font-secondary text-[11.5px] font-bold uppercase tracking-wider text-secondary/70 mb-1.5">
                  Role / Description
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-secondary/15 focus:border-gold rounded-xl font-secondary text-[13.5px] text-secondary focus:outline-hidden transition-colors"
                >
                  <option value="Showroom Manager">Showroom Manager (Catalog & Orders)</option>
                  <option value="Sales Associate">Sales Associate (Inquiries & Stock)</option>
                  <option value="Staff Admin">Staff Admin (General Control)</option>
                  <option value="Inventory Lead">Inventory Lead (Stock Toggles)</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formSendWelcome}
                    onChange={(e) => setFormSendWelcome(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-secondary/30 text-gold focus:ring-gold accent-gold"
                  />
                  <span className="font-secondary text-[12.5px] text-secondary/80">
                    Send instant welcome message on Telegram to notify user
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-secondary/20 font-secondary text-[11.5px] font-bold uppercase tracking-wider text-secondary hover:bg-secondary/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gold hover:bg-gold-dark text-primary font-secondary text-[11.5px] font-bold uppercase tracking-widest rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-primary/50 border-t-primary rounded-full animate-spin" />
                      Authorizing...
                    </>
                  ) : (
                    <>
                      <PiCheckCircleFill size={16} />
                      Authorize Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

