import { logoutUser } from '~/ActionCreators/UserCreator';
import { useDispatch } from 'react-redux';
import cookies from 'react-cookies';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, memo } from 'react';
import store from '~/reducers/Store';
import styles from './Header.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';
const cx = classNames.bind(styles);
const NO_IMAGE = 'http://api-gishub-core.laketech.vn/media/uploads/avatar/2023/12/16/user_y8iDMyO.jpg';

function Header() {
    const [login, setLogin] = useState(false);
    const [_fallback, setFallback] = useState('');

    const handleError = () => {
        setFallback(NO_IMAGE);
    };
    const navigate = useNavigate();
    const state = store.getState();
    useEffect(() => {
        if (state.user?.user?.id) {
            setLogin(true);
        }
    }, [state.user?.user?.id]);
    const dispatch = useDispatch();
    const handleLogout = (e) => {
        cookies.remove('access_token');
        cookies.remove('user');
        dispatch(logoutUser());
        setLogin(false);
    };
    const handleUploadData = (e) => {
        window.open('http://gishub-core.laketech.vn/manage/folder/99ec680b-b73c-4663-a030-91c0f7eaf64a', '_blank');
    };
    const handleLogin = (e) => {
        navigate('/signin');
    };
    return (
        <nav>
            <div className={cx('menu')}>
                <p>Biểu diễn lớp phủ sau phân tích</p>
                {login ? (
                    <div className={cx('user-container')}>
                        <img
                            className={cx('user-avatar')}
                            src={_fallback || state.user?.user?.photo}
                            alt={state.user?.user?.last_name}
                            onError={handleError}
                        />
                        <button className={cx('btn-outline')} onClick={handleUploadData}>
                            <FontAwesomeIcon icon={faArrowUpFromBracket} style={{ paddingRight: '10px' }} />
                            Tải lên dữ liệu
                        </button>
                        <button className={cx('btn-outline')} onClick={handleLogout}>
                            Đăng xuất
                        </button>
                    </div>
                ) : (
                    <button className={cx('btn-outline')} onClick={handleLogin}>
                        Đăng nhập
                    </button>
                )}
            </div>
            <div className={cx('backdrop')}></div>
        </nav>
    );
}

export default memo(Header);
