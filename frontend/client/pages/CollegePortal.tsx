import Dashboard from '../components/college/Dashboard';
import { MainLayout } from '../components/layout/MainLayout';
import { useUser } from '../context/UserContext';

export default function CollegePortal() {
    const { logout } = useUser();

    return (
        <MainLayout>
            <Dashboard onLogout={logout} />
        </MainLayout>
    );
}