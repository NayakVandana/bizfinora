export const profileMenuLinks = [
    {
        label: 'User profile',
        routeName: 'profile.information' as const,
    },
    {
        label: 'Password',
        routeName: 'profile.password' as const,
    },
    {
        label: 'Appearance',
        routeName: 'profile.appearance' as const,
    },
] as const;

export function isProfileRouteActive(routeName: string): boolean {
    return route().current(routeName);
}
