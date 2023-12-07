import { logoutUser } from '~/ActionCreators/UserCreator';
import { useDispatch } from 'react-redux';
import cookies from 'react-cookies';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, memo } from 'react';
import store from '~/reducers/Store';
import styles from './Header.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

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
        <nav>
            <div className={cx('menu')}>
                <p>Code Site</p>
                {login ? (
                    <button className={cx('btn-login')} onClick={handleLogout}>
                        Đăng xuất
                    </button>
                ) : (
                    <button className={cx('btn-login')} onClick={handleLogin}>
                        Đăng nhập
                    </button>
                )}
            </div>
            <div className={cx('backdrop')}></div>
        </nav>
    );
}

export default memo(Header);
