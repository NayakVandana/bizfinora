import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import ProfileLayout from './ProfileLayout';

export default function ProfilePassword() {
    return (
        <ProfileLayout title="Password" headTitle="Password">
            <UpdatePasswordForm />
        </ProfileLayout>
    );
}
