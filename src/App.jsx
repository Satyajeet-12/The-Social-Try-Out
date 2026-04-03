import { useEffect, useMemo, useRef, useState } from 'react';

const copy = {
  en: {
    tagline: 'AI-powered virtual try-on + personalized fit for Indian shoppers',
    chooseGender: 'Choose your style journey',
    male: 'Male',
    female: 'Female',
    selectCategory: 'Select category',
    tryNow: 'Try It On Now',
    measurements: 'Basic Measurements',
    upload: 'Upload Photo',
    live: 'Click Live Photo (4 Profiles)',
    process: 'Generate AI Try-On',
    output: 'Final Output',
    vendor: 'Vendor Onboarding & Catalog',
  },
  hi: {
    tagline: 'भारतीय ग्राहकों के लिए AI वर्चुअल ट्राय-ऑन और पर्सनल फिट',
    chooseGender: 'अपनी स्टाइल यात्रा चुनें',
    male: 'पुरुष',
    female: 'महिला',
    selectCategory: 'कैटेगरी चुनें',
    tryNow: 'अभी ट्राय करें',
    measurements: 'बेसिक माप',
    upload: 'फोटो अपलोड करें',
    live: 'लाइव फोटो लें (4 प्रोफाइल)',
    process: 'AI Try-On बनाएं',
    output: 'अंतिम परिणाम',
    vendor: 'वेंडर ऑनबोर्डिंग और कैटलॉग',
  },
};

const catalog = {
  male: {
    Shirts: [
      { name: 'Classic White Shirt', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Navy Oxford Shirt', image: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Printed Party Shirt', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1000&q=80' },
    ],
    Jeans: [
      { name: 'Slim Blue Denim', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Relaxed Black Jeans', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80' },
    ],
    Shorts: [
      { name: 'Summer Chino Shorts', image: 'https://images.unsplash.com/photo-1506629905607-d6f7f4ca2a47?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Gym Utility Shorts', image: 'https://images.unsplash.com/photo-1565992441121-4367c2967103?auto=format&fit=crop&w=1000&q=80' },
    ],
  },
  female: {
    Kurtis: [
      { name: 'Floral Festive Kurti', image: 'https://images.unsplash.com/photo-1623609163859-ca93c959b98a?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Minimal Cotton Kurti', image: 'https://images.unsplash.com/photo-1617551307538-c9cdb7d71289?auto=format&fit=crop&w=1000&q=80' },
    ],
    Tops: [
      { name: 'Pastel Casual Top', image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Statement Evening Top', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80' },
    ],
    Dresses: [
      { name: 'Fusion Midi Dress', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Elegant Black Dress', image: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1000&q=80' },
    ],
    Jeans: [
      { name: 'High Waist Denim', image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Wide Leg Blue Jeans', image: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=1000&q=80' },
    ],
  },
};

const prompts = ['Front Profile', 'Back Profile', 'Left Side Profile', 'Right Side Profile'];

const getSizeSuggestion = ({ chest, waist, height, weight }) => {
  const score = Number(chest) * 0.4 + Number(waist) * 0.4 + Number(weight) * 0.3 + Number(height) * 0.1;
  if (score < 120) return 'S';
  if (score < 145) return 'M';
  if (score < 170) return 'L';
  return 'XL';
};

function App() {
  const [lang, setLang] = useState('en');
  const t = copy[lang];
  const [gender, setGender] = useState('male');
  const [category, setCategory] = useState('Shirts');
  const [item, setItem] = useState(null);
  const [mode, setMode] = useState('upload');
  const [uploadPreview, setUploadPreview] = useState('');
  const [liveShots, setLiveShots] = useState([]);
  const [capturing, setCapturing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [promptIndex, setPromptIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [fit, setFit] = useState('');
  const [done, setDone] = useState(false);
  const [vendorItems, setVendorItems] = useState([]);
  const [vendorName, setVendorName] = useState('');
  const [vendorProduct, setVendorProduct] = useState('');
  const videoRef = useRef(null);

  const [measurements, setMeasurements] = useState({
    chest: '',
    waist: '',
    height: '',
    weight: '',
  });

  const categories = Object.keys(catalog[gender]);
  const currentItems = catalog[gender][category] ?? [];

  useEffect(() => {
    if (!categories.includes(category)) {
      setCategory(categories[0]);
    }
  }, [gender]);

  useEffect(() => {
    setItem(currentItems[0] ?? null);
  }, [category, gender]);

  const recommendations = useMemo(() => {
    if (!item) return [];
    return currentItems.filter((x) => x.name !== item.name).slice(0, 3);
  }, [currentItems, item]);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.95);
  };

  const runLiveCapture = async () => {
    setLiveShots([]);
    setVideoUrl('');
    setCapturing(true);
    setPromptIndex(0);
    await startCamera();

    const shots = [];
    for (let i = 0; i < 4; i += 1) {
      setPromptIndex(i);
      for (let timer = 3; timer > 0; timer -= 1) {
        setCountdown(timer);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, 1000));
      }
      setCountdown(0);
      shots.push(capturePhoto());
    }

    setLiveShots(shots);
    setCapturing(false);
    const stream = videoRef.current.srcObject;
    if (stream) stream.getTracks().forEach((track) => track.stop());
    createRotatingVideo(shots);
  };

  const createRotatingVideo = async (frames) => {
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(14);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.start();
    for (let i = 0; i < 42; i += 1) {
      const img = new Image();
      img.src = frames[i % 4];
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => {
        img.onload = () => {
          ctx.fillStyle = '#05080f';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 80, 80, 560, 760);
          if (item?.image) {
            const garment = new Image();
            garment.crossOrigin = 'anonymous';
            garment.src = item.image;
            garment.onload = () => {
              ctx.globalAlpha = 0.35;
              ctx.drawImage(garment, 200, 340, 320, 360);
              ctx.globalAlpha = 1;
              ctx.fillStyle = '#9b7bff';
              ctx.font = '28px Inter';
              ctx.fillText('AI Swapped Outfit Preview', 170, 900);
              res();
            };
            garment.onerror = () => res();
          } else {
            res();
          }
        };
      });
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, 130));
    }

    recorder.stop();
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setVideoUrl(URL.createObjectURL(blob));
    };
  };

  const generateResult = () => {
    if (!item) return;
    const size = getSizeSuggestion(measurements);
    setFit(`${size} (${size === 'S' ? 'Slim' : size === 'M' ? 'Regular' : size === 'L' ? 'Comfort' : 'Relaxed'})`);
    setDone(true);
  };

  const onVendorAdd = (e) => {
    e.preventDefault();
    if (!vendorName || !vendorProduct) return;
    setVendorItems((prev) => [...prev, { vendorName, vendorProduct }]);
    setVendorName('');
    setVendorProduct('');
  };

  return (
    <div className="app">
      <header className="hero">
        <nav>
          <h1>The Social Try-Out</h1>
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </nav>
        <div className="hero-content">
          <h2>{t.tagline}</h2>
          <p>Virtual outfit visualization • body-fit intelligence • personalized catalog experience</p>
        </div>
      </header>

      <main>
        <section className="panel">
          <h3>{t.chooseGender}</h3>
          <div className="chip-row">
            <button className={gender === 'male' ? 'active' : ''} onClick={() => setGender('male')}>
              {t.male}
            </button>
            <button className={gender === 'female' ? 'active' : ''} onClick={() => setGender('female')}>
              {t.female}
            </button>
          </div>

          <h4>{t.selectCategory}</h4>
          <div className="chip-row wrap">
            {categories.map((cat) => (
              <button key={cat} className={category === cat ? 'active' : ''} onClick={() => setCategory(cat)}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid">
            {currentItems.map((option) => (
              <article
                key={option.name}
                className={`card ${item?.name === option.name ? 'selected' : ''}`}
                onClick={() => setItem(option)}
              >
                <img src={option.image} alt={option.name} />
                <strong>{option.name}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3>{t.measurements}</h3>
          <div className="form-grid">
            {Object.keys(measurements).map((field) => (
              <label key={field}>
                {field.toUpperCase()}
                <input
                  type="number"
                  placeholder={`Enter ${field}`}
                  value={measurements[field]}
                  onChange={(e) => setMeasurements((prev) => ({ ...prev, [field]: e.target.value }))}
                />
              </label>
            ))}
          </div>

          <div className="chip-row">
            <button className={mode === 'upload' ? 'active' : ''} onClick={() => setMode('upload')}>
              {t.upload}
            </button>
            <button className={mode === 'live' ? 'active' : ''} onClick={() => setMode('live')}>
              {t.live}
            </button>
          </div>

          {mode === 'upload' ? (
            <label className="upload-box">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadPreview(URL.createObjectURL(file));
                    setDone(false);
                  }
                }}
              />
              <span>Click to upload a pre-clicked photo</span>
            </label>
          ) : (
            <div className="live-section">
              <button onClick={runLiveCapture} disabled={capturing}>
                {capturing ? 'Capturing...' : 'Start 4-Profile Capture'}
              </button>
              <video ref={videoRef} autoPlay muted playsInline />
              {capturing && (
                <p>
                  {prompts[promptIndex]} • capturing in {countdown}s
                </p>
              )}
              {!!liveShots.length && (
                <div className="shot-row">
                  {liveShots.map((shot) => (
                    <img key={shot} src={shot} alt="profile shot" />
                  ))}
                </div>
              )}
            </div>
          )}

          <button className="cta" onClick={generateResult}>
            {t.process}
          </button>
        </section>

        <section className="panel">
          <h3>{t.output}</h3>
          {!done && <p>Complete measurements + choose a mode + generate result.</p>}
          {done && (
            <>
              {mode === 'upload' && uploadPreview && (
                <div className="output-card">
                  <img src={uploadPreview} alt="uploaded user" />
                  {item && <img className="overlay" src={item.image} alt={item.name} />}
                </div>
              )}
              {mode === 'live' && videoUrl && (
                <video className="result-video" src={videoUrl} controls loop autoPlay muted />
              )}
              <p>
                <strong>Suggested Size:</strong> {fit || 'N/A'}
              </p>
              <h4>Recommended For You</h4>
              <div className="grid small">
                {recommendations.map((r) => (
                  <article key={r.name} className="card small">
                    <img src={r.image} alt={r.name} />
                    <span>{r.name}</span>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="panel">
          <h3>{t.vendor}</h3>
          <form className="vendor-form" onSubmit={onVendorAdd}>
            <input
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="Vendor / Boutique Name"
            />
            <input
              value={vendorProduct}
              onChange={(e) => setVendorProduct(e.target.value)}
              placeholder="Catalog item"
            />
            <button type="submit">Add to Catalog</button>
          </form>
          <ul>
            {vendorItems.map((v, idx) => (
              <li key={`${v.vendorName}-${idx}`}>
                {v.vendorName} • {v.vendorProduct}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
