import React, { useState } from 'react';

// ========== VERSION 2.0 ==========

const restaurants = [
  { id: 1, name: "Bella Pasta", type: "pasta", rating: 5, price: 2, lat: 59.3293, lng: 18.0686, icon: "🍝" },
  { id: 2, name: "Pizza Perfetto", type: "pizza", rating: 4, price: 1, lat: 59.3326, lng: 18.0649, icon: "🍕" },
  { id: 3, name: "Sushi Master", type: "sushi", rating: 5, price: 3, lat: 59.3359, lng: 18.0719, icon: "🍣" },
  { id: 4, name: "Burger Joint", type: "burger", rating: 3, price: 1, lat: 59.3311, lng: 18.0589, icon: "🍔" },
  { id: 5, name: "Noodle House", type: "asian", rating: 4, price: 2, lat: 59.3380, lng: 18.0650, icon: "🥡" },
  { id: 6, name: "La Trattoria", type: "pasta", rating: 4, price: 3, lat: 59.3245, lng: 18.0710, icon: "🍝" },
  { id: 7, name: "Napoli Express", type: "pizza", rating: 5, price: 2, lat: 59.3402, lng: 18.0580, icon: "🍕" },
  { id: 8, name: "Tokyo Garden", type: "sushi", rating: 4, price: 2, lat: 59.3267, lng: 18.0520, icon: "🍣" },
  { id: 9, name: "Grill & Stack", type: "burger", rating: 5, price: 2, lat: 59.3198, lng: 18.0670, icon: "🍔" },
  { id: 10, name: "Wok This Way", type: "asian", rating: 3, price: 1, lat: 59.3350, lng: 18.0480, icon: "🥡" },
  { id: 11, name: "Carbonara Club", type: "pasta", rating: 3, price: 2, lat: 59.3420, lng: 18.0720, icon: "🍝" },
  { id: 12, name: "Slice of Heaven", type: "pizza", rating: 3, price: 1, lat: 59.3280, lng: 18.0820, icon: "🍕" },
  { id: 13, name: "Omakase", type: "sushi", rating: 5, price: 3, lat: 59.3310, lng: 18.0450, icon: "🍣" },
  { id: 14, name: "Patty Palace", type: "burger", rating: 4, price: 1, lat: 59.3230, lng: 18.0600, icon: "🍔" },
  { id: 15, name: "Golden Dragon", type: "asian", rating: 5, price: 3, lat: 59.3370, lng: 18.0800, icon: "🥡" },
  { id: 16, name: "Alfredo's", type: "pasta", rating: 4, price: 3, lat: 59.3180, lng: 18.0550, icon: "🍝" },
  { id: 17, name: "Pizza Romano", type: "pizza", rating: 4, price: 2, lat: 59.3440, lng: 18.0630, icon: "🍕" },
  { id: 18, name: "Sashimi Dreams", type: "sushi", rating: 3, price: 2, lat: 59.3255, lng: 18.0780, icon: "🍣" },
  { id: 19, name: "The Burger Lab", type: "burger", rating: 5, price: 3, lat: 59.3395, lng: 18.0540, icon: "🍔" },
  { id: 20, name: "Bamboo Kitchen", type: "asian", rating: 4, price: 2, lat: 59.3215, lng: 18.0490, icon: "🥡" }
];

const typeOptions = [
  { value: 'all', label: 'All', icon: '🍽️' },
  { value: 'pizza', label: 'Pizza', icon: '🍕' },
  { value: 'pasta', label: 'Pasta', icon: '🍝' },
  { value: 'sushi', label: 'Sushi', icon: '🍣' },
  { value: 'burger', label: 'Burger', icon: '🍔' },
  { value: 'asian', label: 'Asian', icon: '🥡' },
];

const mapBounds = {
  minLat: 59.3150,
  maxLat: 59.3470,
  minLng: 18.0400,
  maxLng: 18.0900
};

const getPriceColor = (price) => {
  if (price === 1) return '#4ade80';
  if (price === 2) return '#facc15';
  return '#f97316';
};

const getPriceSymbol = (price) => '$'.repeat(price);
const getStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

// ========== ADAPTIVE PIN STYLE ==========

const AdaptivePin = ({ restaurant, showRating, showPrice, isSelected }) => {
  const baseStyle = {
    background: '#18181b',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    transition: 'all 0.15s ease'
  };

  if (!showRating && !showPrice) {
    return (
      <div style={{
        ...baseStyle,
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        border: `2px solid ${isSelected ? '#fafafa' : '#d4a853'}`,
        fontSize: '1.4rem'
      }}>
        {restaurant.icon}
      </div>
    );
  }

  if (showRating && !showPrice) {
    return (
      <div style={{
        ...baseStyle,
        padding: '8px 12px',
        gap: '6px',
        border: `2px solid ${isSelected ? '#fafafa' : '#fbbf24'}`,
        background: 'linear-gradient(135deg, #18181b 0%, #1f1f23 100%)'
      }}>
        <span style={{ fontSize: '1.2rem' }}>{restaurant.icon}</span>
        <span style={{ color: '#fbbf24', fontSize: '0.7rem', letterSpacing: '-1px' }}>
          {'★'.repeat(restaurant.rating)}
        </span>
      </div>
    );
  }

  if (!showRating && showPrice) {
    const priceColor = getPriceColor(restaurant.price);
    return (
      <div style={{
        ...baseStyle,
        padding: '8px 12px',
        gap: '8px',
        border: `2px solid ${isSelected ? '#fafafa' : priceColor}`,
        background: 'linear-gradient(135deg, #18181b 0%, #1f1f23 100%)'
      }}>
        <span style={{ fontSize: '1.2rem' }}>{restaurant.icon}</span>
        <span style={{ color: priceColor, fontSize: '0.85rem', fontWeight: 700, letterSpacing: '-1px' }}>
          {getPriceSymbol(restaurant.price)}
        </span>
      </div>
    );
  }

  const priceColor = getPriceColor(restaurant.price);
  return (
    <div style={{
      ...baseStyle,
      padding: '6px 10px',
      gap: '6px',
      border: `2px solid ${isSelected ? '#fafafa' : '#d4a853'}`,
      background: 'linear-gradient(135deg, #18181b 0%, #1f1f23 100%)'
    }}>
      <span style={{ fontSize: '1.1rem' }}>{restaurant.icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
        <span style={{ color: '#fbbf24', fontSize: '0.55rem', letterSpacing: '-1px' }}>
          {'★'.repeat(restaurant.rating)}
        </span>
        <span style={{ color: priceColor, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '-1px' }}>
          {getPriceSymbol(restaurant.price)}
        </span>
      </div>
    </div>
  );
};

// ========== KEPT PIN DESIGNS (1, 3, 6) ==========

// #1 Classic Circle
const PinDesign1 = ({ restaurant, showRating, showPrice, isSelected }) => (
  <div style={{
    width: '52px',
    height: '52px',
    background: 'linear-gradient(145deg, #1e1e24 0%, #18181b 100%)',
    borderRadius: '50%',
    border: `3px solid ${isSelected ? '#fafafa' : '#d4a853'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    position: 'relative'
  }}>
    {restaurant.icon}
    {showRating && (
      <div style={{
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        background: '#fbbf24',
        color: '#000',
        fontSize: '0.65rem',
        fontWeight: 700,
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #18181b'
      }}>
        {restaurant.rating}
      </div>
    )}
    {showPrice && (
      <div style={{
        position: 'absolute',
        bottom: '-6px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: getPriceColor(restaurant.price),
        color: '#000',
        fontSize: '0.6rem',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: '10px',
        border: '2px solid #18181b'
      }}>
        {getPriceSymbol(restaurant.price)}
      </div>
    )}
  </div>
);

// #3 Horizontal Pill
const PinDesign3 = ({ restaurant, showRating, showPrice, isSelected }) => {
  const borderColor = isSelected ? '#fafafa' : showRating ? '#fbbf24' : showPrice ? getPriceColor(restaurant.price) : '#d4a853';
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: 'linear-gradient(135deg, #1e1e24 0%, #18181b 100%)',
      border: `2px solid ${borderColor}`,
      borderRadius: '30px',
      padding: '8px 14px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    }}>
      <span style={{ fontSize: '1.4rem' }}>{restaurant.icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {showRating && (
          <span style={{ color: '#fbbf24', fontSize: '0.7rem', letterSpacing: '-0.5px' }}>
            {'★'.repeat(restaurant.rating)}{'☆'.repeat(5-restaurant.rating)}
          </span>
        )}
        {showPrice && (
          <span style={{ color: getPriceColor(restaurant.price), fontSize: '0.75rem', fontWeight: 700 }}>
            {getPriceSymbol(restaurant.price)}
          </span>
        )}
        {!showRating && !showPrice && (
          <span style={{ color: '#a1a1aa', fontSize: '0.7rem', textTransform: 'uppercase' }}>
            {restaurant.type}
          </span>
        )}
      </div>
    </div>
  );
};

// #6 Speech Bubble
const PinDesign6 = ({ restaurant, showRating, showPrice, isSelected }) => {
  const borderColor = isSelected ? '#fafafa' : '#d4a853';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        background: 'linear-gradient(145deg, #1e1e24 0%, #18181b 100%)',
        border: `2px solid ${borderColor}`,
        borderRadius: '16px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        <span style={{ fontSize: '1.4rem' }}>{restaurant.icon}</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {showRating && (
            <div style={{ color: '#fbbf24', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontWeight: 700 }}>{restaurant.rating}</span>
              <span>{'★'.repeat(restaurant.rating)}</span>
            </div>
          )}
          {showPrice && (
            <div style={{ color: getPriceColor(restaurant.price), fontSize: '0.7rem', fontWeight: 700 }}>
              {getPriceSymbol(restaurant.price)}
            </div>
          )}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: `10px solid ${borderColor}`
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-7px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid #1e1e24'
        }} />
      </div>
    </div>
  );
};

// ========== NEW PIN DESIGNS ==========

// #2 Neon Glow
const PinDesign2 = ({ restaurant, showRating, showPrice, isSelected }) => {
  const glowColor = showPrice ? getPriceColor(restaurant.price) : showRating ? '#fbbf24' : '#d4a853';
  return (
    <div style={{
      position: 'relative',
      padding: '4px'
    }}>
      <div style={{
        width: '54px',
        height: '54px',
        borderRadius: '50%',
        background: '#18181b',
        border: `2px solid ${isSelected ? '#fafafa' : glowColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.4rem',
        boxShadow: `0 0 20px ${glowColor}60, 0 0 40px ${glowColor}30, inset 0 0 20px ${glowColor}20`,
        position: 'relative'
      }}>
        {restaurant.icon}
        {(showRating || showPrice) && (
          <div style={{
            position: 'absolute',
            bottom: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '4px',
            background: '#0d0d0f',
            padding: '3px 8px',
            borderRadius: '10px',
            border: `1px solid ${glowColor}`,
            boxShadow: `0 0 10px ${glowColor}40`
          }}>
            {showRating && (
              <span style={{ color: '#fbbf24', fontSize: '0.6rem', fontWeight: 700 }}>
                {restaurant.rating}★
              </span>
            )}
            {showPrice && (
              <span style={{ color: getPriceColor(restaurant.price), fontSize: '0.6rem', fontWeight: 700 }}>
                {getPriceSymbol(restaurant.price)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// #4 Compact Square
const PinDesign4 = ({ restaurant, showRating, showPrice, isSelected }) => {
  const accentColor = showRating ? '#fbbf24' : showPrice ? getPriceColor(restaurant.price) : '#d4a853';
  return (
    <div style={{
      background: '#18181b',
      borderRadius: '12px',
      border: `2px solid ${isSelected ? '#fafafa' : accentColor}`,
      padding: '8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
      minWidth: '52px'
    }}>
      <span style={{ fontSize: '1.3rem' }}>{restaurant.icon}</span>
      {(showRating || showPrice) && (
        <div style={{
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
          borderTop: '1px solid #2a2a2e',
          paddingTop: '4px',
          width: '100%',
          justifyContent: 'center'
        }}>
          {showRating && (
            <span style={{ color: '#fbbf24', fontSize: '0.6rem', fontWeight: 600 }}>
              {restaurant.rating}★
            </span>
          )}
          {showPrice && (
            <span style={{ color: getPriceColor(restaurant.price), fontSize: '0.6rem', fontWeight: 700 }}>
              {getPriceSymbol(restaurant.price)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// #5 Flag Banner
const PinDesign5 = ({ restaurant, showRating, showPrice, isSelected }) => {
  const priceColor = getPriceColor(restaurant.price);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Flag top */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1e24 0%, #18181b 100%)',
        border: `2px solid ${isSelected ? '#fafafa' : '#d4a853'}`,
        borderRadius: '10px 10px 0 0',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
      }}>
        <span style={{ fontSize: '1.3rem' }}>{restaurant.icon}</span>
        {(showRating || showPrice) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {showRating && (
              <span style={{ color: '#fbbf24', fontSize: '0.65rem' }}>
                {'★'.repeat(restaurant.rating)}
              </span>
            )}
            {showPrice && (
              <span style={{ color: priceColor, fontSize: '0.7rem', fontWeight: 700 }}>
                {getPriceSymbol(restaurant.price)}
              </span>
            )}
          </div>
        )}
      </div>
      {/* Flag tail */}
      <div style={{
        width: '0',
        height: '0',
        borderLeft: '24px solid transparent',
        borderRight: '24px solid transparent',
        borderTop: `12px solid ${isSelected ? '#fafafa' : '#d4a853'}`
      }} />
    </div>
  );
};

// #7 Diamond
const PinDesign7 = ({ restaurant, showRating, showPrice, isSelected }) => {
  const accentColor = showPrice ? getPriceColor(restaurant.price) : showRating ? '#fbbf24' : '#d4a853';
  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        width: '50px',
        height: '50px',
        background: 'linear-gradient(135deg, #1e1e24 0%, #18181b 100%)',
        border: `2px solid ${isSelected ? '#fafafa' : accentColor}`,
        borderRadius: '8px',
        transform: 'rotate(45deg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        <span style={{ 
          fontSize: '1.4rem', 
          transform: 'rotate(-45deg)'
        }}>
          {restaurant.icon}
        </span>
      </div>
      {showRating && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fbbf24',
          color: '#000',
          fontSize: '0.6rem',
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: '6px'
        }}>
          {restaurant.rating}★
        </div>
      )}
      {showPrice && (
        <div style={{
          position: 'absolute',
          bottom: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: getPriceColor(restaurant.price),
          color: '#000',
          fontSize: '0.6rem',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '6px'
        }}>
          {getPriceSymbol(restaurant.price)}
        </div>
      )}
    </div>
  );
};

// #8 Floating Card
const PinDesign8 = ({ restaurant, showRating, showPrice, isSelected }) => {
  return (
    <div style={{
      background: 'linear-gradient(145deg, #1e1e24 0%, #18181b 100%)',
      borderRadius: '14px',
      border: `2px solid ${isSelected ? '#fafafa' : '#3a3a3e'}`,
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
      transform: 'translateY(-4px)'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        background: '#0d0d0f',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.3rem'
      }}>
        {restaurant.icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {showRating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700 }}>
              {restaurant.rating}.0
            </span>
            <span style={{ color: '#fbbf24', fontSize: '0.6rem' }}>
              {'★'.repeat(restaurant.rating)}
            </span>
          </div>
        )}
        {showPrice && (
          <span style={{ 
            color: getPriceColor(restaurant.price), 
            fontSize: '0.7rem', 
            fontWeight: 700 
          }}>
            {getPriceSymbol(restaurant.price)} · {restaurant.price === 1 ? 'Budget' : restaurant.price === 2 ? 'Mid' : 'Premium'}
          </span>
        )}
        {!showRating && !showPrice && (
          <span style={{ color: '#71717a', fontSize: '0.7rem', textTransform: 'capitalize' }}>
            {restaurant.type}
          </span>
        )}
      </div>
    </div>
  );
};

// #9 Name Label
const PinDesign9 = ({ restaurant, showRating, showPrice, isSelected }) => {
  const accentColor = showRating ? '#fbbf24' : showPrice ? getPriceColor(restaurant.price) : '#d4a853';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Main pin */}
      <div style={{
        background: 'linear-gradient(145deg, #1e1e24 0%, #18181b 100%)',
        border: `2px solid ${isSelected ? '#fafafa' : accentColor}`,
        borderRadius: '14px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        <span style={{ fontSize: '1.2rem' }}>{restaurant.icon}</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ 
            color: '#fafafa', 
            fontSize: '0.8rem', 
            fontWeight: 600,
            maxWidth: '100px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {restaurant.name}
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {showRating && (
              <span style={{ color: '#fbbf24', fontSize: '0.6rem', fontWeight: 600 }}>
                {restaurant.rating}★
              </span>
            )}
            {showPrice && (
              <span style={{ color: getPriceColor(restaurant.price), fontSize: '0.6rem', fontWeight: 700 }}>
                {getPriceSymbol(restaurant.price)}
              </span>
            )}
            {!showRating && !showPrice && (
              <span style={{ color: '#71717a', fontSize: '0.6rem', textTransform: 'uppercase' }}>
                {restaurant.type}
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Pointer */}
      <div style={{
        width: 0,
        height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: `8px solid ${isSelected ? '#fafafa' : accentColor}`,
        marginTop: '-1px'
      }} />
    </div>
  );
};

// #10 Full Card
const PinDesign10 = ({ restaurant, showRating, showPrice, isSelected }) => {
  return (
    <div style={{
      background: '#18181b',
      border: `2px solid ${isSelected ? '#fafafa' : '#2a2a2e'}`,
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      minWidth: '140px'
    }}>
      {/* Header with icon and name */}
      <div style={{
        background: 'linear-gradient(135deg, #d4a853 0%, #b8942e 100%)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ fontSize: '1.3rem' }}>{restaurant.icon}</span>
        <span style={{ 
          color: '#0d0d0f', 
          fontSize: '0.85rem', 
          fontWeight: 700,
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {restaurant.name}
        </span>
      </div>
      {/* Details */}
      <div style={{
        padding: '10px 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {showRating ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 700 }}>
              {restaurant.rating}.0
            </span>
            <span style={{ color: '#fbbf24', fontSize: '0.65rem' }}>
              {'★'.repeat(restaurant.rating)}
            </span>
          </div>
        ) : (
          <span style={{ color: '#71717a', fontSize: '0.7rem', textTransform: 'uppercase' }}>
            {restaurant.type}
          </span>
        )}
        {showPrice && (
          <span style={{ 
            color: getPriceColor(restaurant.price), 
            fontSize: '0.75rem', 
            fontWeight: 700,
            background: `${getPriceColor(restaurant.price)}20`,
            padding: '3px 8px',
            borderRadius: '6px'
          }}>
            {getPriceSymbol(restaurant.price)}
          </span>
        )}
      </div>
    </div>
  );
};

const pinDesigns = [
  { id: 'adaptive', name: 'Adaptive', description: 'Auto-adjusts to filters', Component: AdaptivePin, isAdaptive: true },
  { id: 1, name: 'Classic Circle', description: 'Badge overlays', Component: PinDesign1 },
  { id: 2, name: 'Neon Glow', description: 'Glowing effect', Component: PinDesign2 },
  { id: 3, name: 'Horizontal Pill', description: 'Wide capsule', Component: PinDesign3 },
  { id: 4, name: 'Compact Square', description: 'Minimal box', Component: PinDesign4 },
  { id: 5, name: 'Flag Banner', description: 'Banner with tail', Component: PinDesign5 },
  { id: 6, name: 'Speech Bubble', description: 'Tooltip pointer', Component: PinDesign6 },
  { id: 7, name: 'Diamond', description: 'Rotated square', Component: PinDesign7 },
  { id: 8, name: 'Floating Card', description: 'Elevated card', Component: PinDesign8 },
  { id: 9, name: 'Name Label', description: 'Shows place name', Component: PinDesign9 },
  { id: 10, name: 'Full Card', description: 'Rich name card', Component: PinDesign10 },
];

export default function RestaurantMap() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [hoveredRestaurant, setHoveredRestaurant] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [pinStyleMenuOpen, setPinStyleMenuOpen] = useState(false);
  const [selectedPinStyle, setSelectedPinStyle] = useState('adaptive');

  const toggleRating = (rating) => {
    if (selectedRatings.includes(rating)) {
      setSelectedRatings(selectedRatings.filter(r => r !== rating));
    } else {
      setSelectedRatings([...selectedRatings, rating]);
    }
  };

  const togglePrice = (price) => {
    if (selectedPrices.includes(price)) {
      setSelectedPrices(selectedPrices.filter(p => p !== price));
    } else {
      setSelectedPrices([...selectedPrices, price]);
    }
  };

  const resetFilters = () => {
    setSelectedType('all');
    setSelectedRatings([]);
    setSelectedPrices([]);
    setSelectedRestaurant(null);
  };

  const filteredRestaurants = restaurants.filter(r => {
    const typeMatch = selectedType === 'all' || r.type === selectedType;
    const ratingMatch = selectedRatings.length === 0 || selectedRatings.includes(r.rating);
    const priceMatch = selectedPrices.length === 0 || selectedPrices.includes(r.price);
    return typeMatch && ratingMatch && priceMatch;
  });

  const getPosition = (lat, lng) => {
    const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    const y = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
    return { x, y };
  };

  const hasActiveFilters = selectedType !== 'all' || selectedRatings.length > 0 || selectedPrices.length > 0;
  const showRating = selectedRatings.length > 0;
  const showPrice = selectedPrices.length > 0;

  const currentPinDesign = pinDesigns.find(p => p.id === selectedPinStyle);
  const CurrentPinComponent = currentPinDesign?.Component || AdaptivePin;

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      background: '#0d0d0f',
      color: '#fafafa',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '340px',
        background: '#18181b',
        borderRight: '1px solid #2a2a2e',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        zIndex: 10
      }}>
        <header style={{ padding: '24px 20px', borderBottom: '1px solid #2a2a2e' }}>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Dine<span style={{ color: '#d4a853' }}>Map</span>
            <span style={{
              display: 'inline-block',
              fontSize: '0.6rem',
              background: '#d4a853',
              color: '#0d0d0f',
              padding: '3px 8px',
              borderRadius: '4px',
              marginLeft: '10px',
              fontWeight: 600,
              verticalAlign: 'middle'
            }}>v2.0</span>
          </h1>
        </header>

        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          {/* Restaurant Type */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#71717a',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '12px'
            }}>Restaurant Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {typeOptions.map(type => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  style={{
                    background: selectedType === type.value ? 'rgba(212, 168, 83, 0.15)' : '#0d0d0f',
                    border: `1px solid ${selectedType === type.value ? '#d4a853' : '#2a2a2e'}`,
                    borderRadius: '10px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: selectedType === type.value ? '#d4a853' : '#a1a1aa',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rating</label>
              <span style={{ fontSize: '0.65rem', color: selectedRatings.length === 0 ? '#4ade80' : '#fbbf24', fontWeight: 500 }}>
                {selectedRatings.length === 0 ? 'Showing all' : `${selectedRatings.length} selected`}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => toggleRating(rating)}
                  style={{
                    flex: 1,
                    background: selectedRatings.includes(rating) ? 'rgba(251, 191, 36, 0.15)' : '#0d0d0f',
                    border: `1px solid ${selectedRatings.includes(rating) ? '#fbbf24' : '#2a2a2e'}`,
                    borderRadius: '10px',
                    padding: '10px 4px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    color: selectedRatings.includes(rating) ? '#fbbf24' : '#a1a1aa',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>{'★'.repeat(rating)}</span>
                  <span>{rating}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Price Range</label>
              <span style={{ fontSize: '0.65rem', color: selectedPrices.length === 0 ? '#4ade80' : '#d4a853', fontWeight: 500 }}>
                {selectedPrices.length === 0 ? 'Showing all' : `${selectedPrices.length} selected`}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { price: 1, label: 'Budget', symbol: '$' },
                { price: 2, label: 'Mid', symbol: '$$' },
                { price: 3, label: 'Premium', symbol: '$$$' }
              ].map(({ price, label, symbol }) => (
                <button
                  key={price}
                  onClick={() => togglePrice(price)}
                  style={{
                    flex: 1,
                    background: selectedPrices.includes(price) ? `${getPriceColor(price)}20` : '#0d0d0f',
                    border: `1px solid ${selectedPrices.includes(price) ? getPriceColor(price) : '#2a2a2e'}`,
                    borderRadius: '10px',
                    padding: '12px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    color: selectedPrices.includes(price) ? getPriceColor(price) : '#a1a1aa',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '1rem', fontWeight: 600 }}>{symbol}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pin Style Button */}
          <button
            onClick={() => setPinStyleMenuOpen(true)}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #1e1e24 0%, #18181b 100%)',
              border: '1px solid #d4a853',
              borderRadius: '12px',
              padding: '14px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#fafafa',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>🎨</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pin Style</div>
                <div style={{ fontSize: '0.7rem', color: '#71717a' }}>
                  {currentPinDesign?.name}
                  {currentPinDesign?.isAdaptive && (
                    <span style={{ color: '#4ade80', marginLeft: '6px' }}>● Auto</span>
                  )}
                </div>
              </div>
            </div>
            <span style={{ color: '#d4a853', fontSize: '1.2rem' }}>›</span>
          </button>
        </div>

        {/* Results Bar */}
        <div style={{
          padding: '16px 20px',
          background: '#0d0d0f',
          borderTop: '1px solid #2a2a2e',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
            Showing <strong style={{ color: '#d4a853' }}>{filteredRestaurants.length}</strong> of {restaurants.length}
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              style={{
                background: 'transparent',
                border: '1px solid #2a2a2e',
                borderRadius: '6px',
                padding: '6px 14px',
                color: '#a1a1aa',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </aside>

      {/* Map Area */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        overflow: 'hidden'
      }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          pointerEvents: 'none'
        }} />

        {/* Stockholm label */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          fontSize: '0.7rem',
          color: '#71717a',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          background: 'rgba(0,0,0,0.5)',
          padding: '8px 12px',
          borderRadius: '6px'
        }}>
          📍 Stockholm, Sweden
        </div>

        {/* Restaurant Pins */}
        {filteredRestaurants.map(restaurant => {
          const pos = getPosition(restaurant.lat, restaurant.lng);
          const isHovered = hoveredRestaurant === restaurant.id;
          const isSelected = selectedRestaurant === restaurant.id;

          return (
            <div
              key={restaurant.id}
              style={{
                position: 'absolute',
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: `translate(-50%, -50%) scale(${isHovered || isSelected ? 1.1 : 1})`,
                zIndex: isHovered || isSelected ? 100 : 10,
                transition: 'transform 0.15s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={() => setHoveredRestaurant(restaurant.id)}
              onMouseLeave={() => setHoveredRestaurant(null)}
              onClick={() => setSelectedRestaurant(isSelected ? null : restaurant.id)}
            >
              <CurrentPinComponent
                restaurant={restaurant}
                showRating={showRating}
                showPrice={showPrice}
                isSelected={isSelected}
              />

              {/* Popup */}
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 12px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#18181b',
                  border: '1px solid #2a2a2e',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  minWidth: '180px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  zIndex: 200
                }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, marginBottom: '2px' }}>{restaurant.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#d4a853', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>{restaurant.type}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #2a2a2e' }}>
                    <span style={{ color: '#fbbf24', fontSize: '0.8rem' }}>{getStars(restaurant.rating)}</span>
                    <span style={{ color: getPriceColor(restaurant.price), fontWeight: 600, fontSize: '0.85rem' }}>{getPriceSymbol(restaurant.price)}</span>
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%) rotate(45deg)',
                    width: '14px',
                    height: '14px',
                    background: '#18181b',
                    borderRight: '1px solid #2a2a2e',
                    borderBottom: '1px solid #2a2a2e'
                  }} />
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {filteredRestaurants.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#71717a'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🍽️</div>
            <p style={{ fontSize: '1rem' }}>No restaurants match your filters</p>
            <button
              onClick={resetFilters}
              style={{
                marginTop: '12px',
                background: '#d4a853',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                color: '#0d0d0f',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Slide-up Pin Style Menu */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          opacity: pinStyleMenuOpen ? 1 : 0,
          visibility: pinStyleMenuOpen ? 'visible' : 'hidden',
          transition: 'all 0.3s ease',
          zIndex: 1000
        }}
        onClick={() => setPinStyleMenuOpen(false)}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#18181b',
          borderRadius: '24px 24px 0 0',
          transform: pinStyleMenuOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease',
          zIndex: 1001,
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Handle */}
        <div style={{ padding: '12px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '4px', background: '#3a3a3e', borderRadius: '2px' }} />
        </div>

        {/* Header */}
        <div style={{
          padding: '8px 24px 20px',
          borderBottom: '1px solid #2a2a2e',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
              Choose Pin Style
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#71717a' }}>
              11 styles available · Select to preview on map
            </p>
          </div>
          <button
            onClick={() => setPinStyleMenuOpen(false)}
            style={{
              background: '#2a2a2e',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: '#a1a1aa',
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Pin Options Grid */}
        <div style={{
          padding: '20px 24px 32px',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Adaptive Section */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#4ade80',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>●</span> Recommended
            </div>
            <button
              onClick={() => {
                setSelectedPinStyle('adaptive');
                setPinStyleMenuOpen(false);
              }}
              style={{
                width: '100%',
                background: selectedPinStyle === 'adaptive' ? 'rgba(74, 222, 128, 0.1)' : '#0d0d0f',
                border: `2px solid ${selectedPinStyle === 'adaptive' ? '#4ade80' : '#2a2a2e'}`,
                borderRadius: '16px',
                padding: '16px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
            >
              {/* Preview states */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ transform: 'scale(0.7)', transformOrigin: 'center' }}>
                  <AdaptivePin
                    restaurant={{ icon: '🍕', rating: 4, price: 2, type: 'pizza' }}
                    showRating={false}
                    showPrice={false}
                    isSelected={false}
                  />
                </div>
                <span style={{ color: '#71717a', fontSize: '1.2rem' }}>→</span>
                <div style={{ transform: 'scale(0.7)', transformOrigin: 'center' }}>
                  <AdaptivePin
                    restaurant={{ icon: '🍕', rating: 4, price: 2, type: 'pizza' }}
                    showRating={true}
                    showPrice={false}
                    isSelected={false}
                  />
                </div>
                <span style={{ color: '#71717a', fontSize: '1.2rem' }}>→</span>
                <div style={{ transform: 'scale(0.7)', transformOrigin: 'center' }}>
                  <AdaptivePin
                    restaurant={{ icon: '🍕', rating: 4, price: 2, type: 'pizza' }}
                    showRating={true}
                    showPrice={true}
                    isSelected={false}
                  />
                </div>
              </div>
              
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: selectedPinStyle === 'adaptive' ? '#4ade80' : '#fafafa',
                  marginBottom: '4px'
                }}>
                  Adaptive
                </div>
                <div style={{ fontSize: '0.75rem', color: '#71717a' }}>
                  Changes shape based on active filters
                </div>
              </div>

              {selectedPinStyle === 'adaptive' && (
                <div style={{
                  background: '#4ade80',
                  color: '#0d0d0f',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}>
                  ✓
                </div>
              )}
            </button>
          </div>

          {/* Static Styles Section */}
          <div style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: '#71717a',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '12px'
          }}>
            Static Styles
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px'
          }}>
            {pinDesigns.filter(p => !p.isAdaptive).map(({ id, name, description, Component }) => {
              const isActive = selectedPinStyle === id;
              const sampleRestaurant = { icon: '🍕', type: 'pizza', rating: 4, price: 2 };
              
              return (
                <button
                  key={id}
                  onClick={() => {
                    setSelectedPinStyle(id);
                    setPinStyleMenuOpen(false);
                  }}
                  style={{
                    background: isActive ? 'rgba(212, 168, 83, 0.1)' : '#0d0d0f',
                    border: `2px solid ${isActive ? '#d4a853' : '#2a2a2e'}`,
                    borderRadius: '14px',
                    padding: '14px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  {/* Preview */}
                  <div style={{
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'scale(0.7)'
                  }}>
                    <Component
                      restaurant={sampleRestaurant}
                      showRating={true}
                      showPrice={true}
                      isSelected={false}
                    />
                  </div>
                  
                  {/* Label */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{
                        background: isActive ? '#d4a853' : '#3a3a3e',
                        color: isActive ? '#0d0d0f' : '#a1a1aa',
                        fontSize: '0.55rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        #{id}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: isActive ? '#d4a853' : '#fafafa'
                      }}>
                        {name}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '0.6rem',
                      color: '#71717a'
                    }}>
                      {description}
                    </div>
                  </div>

                  {/* Checkmark */}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: '#d4a853',
                      color: '#0d0d0f',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 700
                    }}>
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
