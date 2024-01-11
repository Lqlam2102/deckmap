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
import images from '~/assets/image';
const cx = classNames.bind(styles);

function Header() {
    const [login, setLogin] = useState(false);
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
        window.open('http://gishub-core.laketech.vn/manage/folder/dfc0d9e9-57f5-4598-bca9-e7df8910d547', '_blank');
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
                            src={images['avatar_default'] || state.user?.user?.photo}
                            alt={state.user?.user?.last_name}
                        />
                        <button className={cx('btn-outline', 'btn-upload')} onClick={handleUploadData}>
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
