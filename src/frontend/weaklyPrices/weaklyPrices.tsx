"use client"

import './weaklyPrices.css';
import 'tailwindcss/tailwind.css'

import MainPage from './pages/mainPage';
import DetailsPage from './pages/detailsPage';

import { useState } from 'react';

export default function WeaklyPrices() {

    const [catalogueName, setCatalogueName] = useState('');
    const states = {
        catalogueName: catalogueName,
        setCatalogueName: setCatalogueName
    };

    return (
        <div className='weaklyPrices-page'>

            <div className="page-title">
                <div>Weakly</div>
                <div>Prices</div>
            </div>

            <div className="card-display">
                {
                    catalogueName ? 
                    <DetailsPage states={states} /> :
                    <MainPage setCatalogueName={setCatalogueName} />
                }
                
            </div>
        </div>
    );
      
}