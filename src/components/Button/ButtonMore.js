import classNames from 'classnames/bind';
import styles from './ButtonMore.module.scss';
import React from 'react';
const cx = classNames.bind(styles);

export function ButtonMore() {
    return (
        <button className={cx('learn-more', 'btn-more')}>
            <span className={cx('circle')} aria-hidden="true">
                <span className={cx('icon', 'arrow')}></span>
            </span>
            <span className={cx('button-text')}>Bản đồ</span>
        </button>
    );
}
