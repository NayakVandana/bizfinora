import AppearanceTabs from '@/Components/AppearanceTabs';
import ProfileLayout from './ProfileLayout';

export default function ProfileAppearance() {
    return (
        <ProfileLayout title="Appearance" headTitle="Appearance settings">
            <AppearanceTabs />
        </ProfileLayout>
    );
}
