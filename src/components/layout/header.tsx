import { useAuthStore } from "@/stores";
import { Avatar, AvatarFallback, AvatarImage, SidebarTrigger } from "../ui";

const Header = () => {
  const { user } = useAuthStore();
  const fullName = user?.firstName + " " + user?.lastName;
  return (
    <div className="h-16 sticky top-0 z-40 w-full flex-shrink-0">
      <div className="flex h-full items-center px-4 border-b bg-background">
        <div className="flex items-center justify-between w-full">
          <div>
            <SidebarTrigger />
          </div>
          <div className="justify-end">
            <Avatar className="w-8 h-8">
              <AvatarImage src="" />
              <AvatarFallback className="text-[12px] font-semibold">
                {fullName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
