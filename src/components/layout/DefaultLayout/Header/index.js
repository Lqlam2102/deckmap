import { logoutUser } from '~/ActionCreators/UserCreator';
import { useDispatch } from 'react-redux';
import cookies from 'react-cookies';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, memo } from 'react';
import store from '~/reducers/Store';
function Header() {
    const [login, setLogin] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const state = store.getState();
        if (state.user?.user?.id) {
            setLogin(true);
        }
    }, []);
    const dispatch = useDispatch();
    const handleLogout = (e) => {
        cookies.remove('access_token');
        cookies.remove('user');
        dispatch(logoutUser());
        setLogin(false);
    };
    const handleLogin = (e) => {
        navigate('/signin');
    };
    return (
        <>
            <h2>Header</h2>
            {login ? <button onClick={handleLogout}>OUT</button> : <button onClick={handleLogin}>Login</button>}
        </>
    );
}

export default memo(Header);
