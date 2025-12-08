import React from "react";
import css from '@/styles/authLayout.module.css'
import Image from "next/image";

const AuthLayout = ({children}) => {
    return (
        <div className={css.wrapper}>
            <div className={css.container}>
                <div className={css.left}>
                    {children}
                </div>
                <div className={css.right}>
                    <Image
                    src='/images/auth.png'
                    alt='Authentication'
                    height={480}
                    width={400}
                    quality={100}
                    />
                </div>
            </div>
        </div>
    )
}

export default AuthLayout;