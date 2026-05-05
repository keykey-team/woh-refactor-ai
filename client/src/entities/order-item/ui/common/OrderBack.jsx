"use client"
import { useRouter } from 'next/navigation'
import React from 'react'

const OrderBack = () => {
    const router = useRouter()
    return (
        <span className="ob" onClick={() => { router.push("/profile/history") }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="7" height="11" viewBox="0 0 7 11" fill="none">
                <path d="M5.33789 9.66431L1.33789 5.16431L5.33789 0.664307" stroke="#0F172A" strokeWidth="2" />
            </svg> Дивитись всі товари</span>
    )
}

export default OrderBack
