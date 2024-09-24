import fb from './firebase';
import useAuthState from './hooks';



export default function signin() {
    const {user, initializing} = useAuthState(fb.auth());
    const signinwithgoogle = async() => {
        const provider = new fb.auth.GoogleAuthProvider();
        fb.auth().useDeviceLanguage();

        try{
            const result = await fb.auth().signInWithPopup(provider);
            console.log("Sign-in successful", result.user);
        }catch(error){
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

    if (initializing){
        return 'Loading...';
    }

        return (
            <div>
                {user 
                    ? <div className="mt-20 text-center">
                        <img src={user.photoURL} alt="" className='w-20 h-20 rounded-full mx-auto'/>    
                        <p>{user.displayName}</p>
                        <button className='border-2 border-black mt-4'
                            onClick={handleLogout}
                        >
                            Log out
                        </button>
                      </div>
                    : <div className="mt-20 text-center">
                        <button className='border-2 border-black'
                            onClick={signinwithgoogle}
                        >
                            sign in with google
                        </button>
                      </div>
                }
            </div>
        )
}
