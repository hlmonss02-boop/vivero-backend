import Ahorros from '../components/Ahorros';

function AhorrosPage() {
    return (
        <div className="p-4 md:p-6">
            <h1 className="text-2xl font-bold mb-6" style={{ color: '#1B4332' }}>
                Ahorros para Renta
            </h1>
            <Ahorros />
        </div>
    );
}

export default AhorrosPage;