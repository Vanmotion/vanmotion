// Read-only diagnostic: reports the actual response from the weather provider.
const url = 'https://api.open-meteo.com/v1/forecast?latitude=40.4168&longitude=-3.7038&current=weather_code,cloud_cover,precipitation,rain,snowfall&timezone=Europe%2FMadrid&timeformat=unixtime';
const response = await fetch(url, {signal:AbortSignal.timeout(8000)});
if (!response.ok) throw new Error(`Open-Meteo HTTP ${response.status}`);
const data = await response.json();
console.log('Modelo meteorológico: Open-Meteo · Madrid centro');
console.log('Consulta:', new Date().toISOString());
console.log('Muestra UTC:', new Date(data.current.time*1000).toISOString());
console.log('Zona:', data.timezone);
console.log('Código WMO:', data.current.weather_code);
console.log('Nubosidad:', data.current.cloud_cover+'%');
console.log('Lluvia:', data.current.rain, 'mm; precipitación:', data.current.precipitation, 'mm; nieve:', data.current.snowfall, 'cm');
console.log('Son datos del modelo, no una observación directa de tu calle.');
