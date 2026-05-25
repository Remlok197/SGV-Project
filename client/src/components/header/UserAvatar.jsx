import { Avatar } from "@heroui/react";

export default function UserAvatar({userName}){

    const bgColor = getAvatarColor(userName);
    const initials = getAvatarInitials(userName);

    return(
        <Avatar className="text-background size-8 md:size-12 text-sm md:text-xl"
                style={{ backgroundColor: bgColor }}>
            {getAvatarInitials(userName)}
        </Avatar>
    );
}

const getAvatarInitials = (name) => {
    if (!name) return "??";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

const getAvatarColor = (name) => {
    if (!name) return "#ee791c"; 
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    let color = "#";
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
};