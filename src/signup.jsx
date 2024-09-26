import fb from './firebase';
import useAuthState from './hooks';
import { useNavigate } from 'react-router-dom';

export default function SignIn() {
    const { user, initializing } = useAuthState(fb.auth());
    const navigate = useNavigate();

    const signinWithGoogle = async () => {
        const provider = new fb.auth.GoogleAuthProvider();
        fb.auth().useDeviceLanguage();

        try {
            const result = await fb.auth().signInWithPopup(provider);
            console.log("Sign-in successful", result.user);
        } catch (error) {
            console.log("Sign-in error", error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await fb.auth().signOut();
            console.log("User signed out successfully");
        } catch (error) {
            console.log("Logout error", error.message);
        }
    };

    if (initializing) {
        return 'Loading...';
    }

    return (
        <div className="auth-container">
            {user ? (
                <div className="user-info">
                    <button onClick={() => navigate(-1)} className="back-button show-back">Back</button>
                    <img src={user.photoURL} alt="" className="user-avatar" />
                    <p className="user-name">{user.displayName}</p>
                    <button className="logout-button" onClick={handleLogout}>
                        Log out
                    </button>
                </div>
            ) : (
                <div className="signin-container">
                    <button className="signin-button" onClick={signinWithGoogle}>
                        Sign in with Google
                    </button>
                </div>
            )}
        </div>
    );
}
