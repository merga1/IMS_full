import { Bell } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/ui/popover";
import { ScrollArea } from "@/shared/ui/scroll-area";

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        title: "Asset Request Approved",
        description: "Your request for 'MacBook Pro' has been approved.",
        time: "5m ago",
        type: "success",
        read: false,
    },
    {
        id: 2,
        title: "New Policy Update",
        description: "Please review the updated Asset Handling Policy.",
        time: "1h ago",
        type: "info",
        read: false,
    },
    {
        id: 3,
        title: "Maintenance Scheduled",
        description: "Server maintenance is scheduled for tonight at 2 AM.",
        time: "3h ago",
        type: "warning",
        read: true,
    },
    {
        id: 4,
        title: "Asset Handover Confirmed",
        description: "HP LaserJet Printer handover confirmed by recipient.",
        time: "1d ago",
        type: "success",
        read: true,
    },
];

export function NotificationsPopover() {
    const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
                </div>
                <ScrollArea className="h-[300px]">
                    <div className="grid">
                        {MOCK_NOTIFICATIONS.map((notification) => (
                            <div
                                key={notification.id}
                                className={`flex gap-3 px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors ${!notification.read ? "bg-muted/20" : ""
                                    }`}
                            >
                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notification.type === 'success' ? 'bg-green-500' :
                                    notification.type === 'warning' ? 'bg-yellow-500' :
                                        'bg-blue-500'
                                    }`} />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{notification.title}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {notification.description}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground pt-1">{notification.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-2 border-t text-center">
                    <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
                        Mark all as read
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
