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
const NO_IMAGE =
    'data:image/png;base64,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';

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
