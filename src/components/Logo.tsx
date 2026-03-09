import React from 'react';

const LOGO_URL = "https://static.wixstatic.com/media/06d55b_654cf56ff23a4f1eafe8b3bf7b8bdda1~mv2.png/v1/crop/x_0,y_5,w_8192,h_2562/fill/w_886,h_278,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/SENTINEL%20AP%20LOGO%20MASTER_001.png";

export function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <img 
      src={LOGO_URL} 
      alt="Sentinel Advisory Partners" 
      className={`object-contain ${className}`}
      referrerPolicy="no-referrer"
    />
  );
}

export function LogoIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <img 
      src={LOGO_URL} 
      alt="Sentinel Advisory Partners" 
      className={`object-contain ${className}`}
      referrerPolicy="no-referrer"
    />
  );
}
