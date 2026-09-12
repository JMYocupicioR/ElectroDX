import React, { useEffect, useState } from 'react';
import { Home, BarChart3, User, Lightbulb } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BaseLayout, LayoutColors, NavItem } from './BaseLayout';

interface UserLayoutProps {
    children: React.ReactNode;
    title: string;
}

const userNavItems: NavItem[] = [
    { icon: Home, label: 'Mi Progreso', mobileLabel: 'Progreso', path: '/user/dashboard' },
    { icon: Lightbulb, label: 'Mis Perlas', mobileLabel: 'Perlas', path: '/user/pearls' },
    { icon: BarChart3, label: 'Mis Analíticas', mobileLabel: 'Analíticas', path: '/user/analytics' },
    { icon: User, label: 'Mi Perfil', mobileLabel: 'Perfil', path: '/user/profile' },
];

const userColors: LayoutColors = {
    pageBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    sidebarBg: 'bg-gradient-to-b from-indigo-600 to-indigo-800',
    sidebarActive: 'bg-indigo-500 text-white font-medium shadow-md',
    sidebarInactive: 'hover:bg-indigo-500 hover:text-white text-indigo-100',
    sidebarBorder: 'border-indigo-500',
    sidebarLogout: 'text-red-300 hover:bg-red-500 hover:text-white',
    subtitleColor: 'text-indigo-300',
    mobileHeaderBg: 'bg-indigo-600',
    mobileSubtitleColor: 'text-indigo-200',
    mobileNavBg: 'bg-indigo-700',
    mobileNavBorder: 'border-indigo-600',
    mobileNavActive: 'text-white font-medium bg-white/10',
    mobileNavInactive: 'text-indigo-200 hover:text-white active:bg-white/10',
    mobileLogout: 'text-red-300 hover:text-white active:bg-red-500',
};

export const UserLayout: React.FC<UserLayoutProps> = ({ children, title }) => {
    const [userName, setUserName] = useState<string>('');

    useEffect(() => {
        const fetchUserName = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('full_name')
                    .eq('user_id', user.id)
                    .single();
                if (profile && profile.full_name) {
                    setUserName(profile.full_name);
                } else if (user.email) {
                    setUserName(user.email.split('@')[0]);
                }
            }
        };
        fetchUserName();
    }, []);

    const headerExtra = userName ? (
        <p className="text-indigo-100 text-xs mt-2 ml-12 font-medium truncate">
            {userName}
        </p>
    ) : null;

    return (
        <BaseLayout
            title={title}
            navItems={userNavItems}
            colors={userColors}
            basePath="/user"
            headerExtra={headerExtra}
        >
            {children}
        </BaseLayout>
    );
};
