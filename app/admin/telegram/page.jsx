import TelegramAdminManager from "@/components/admin/TelegramAdminManager";

export const metadata = {
  title: "Telegram Bot Admins | Kal Furniture Command Studio",
  description: "Manage and authorize Telegram administrator accounts for @KalFurnitureAdminBot.",
};

export default function TelegramAdminPage() {
  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <TelegramAdminManager />
    </div>
  );
}

