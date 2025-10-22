import { useNavigate } from 'react-router-dom'

export function BotonVolver() {
  const navigate = useNavigate()

  const handleVolver = () => {
    navigate(-1)
  }

  return (
    <div className="text-center mb-4">
      <button 
        onClick={handleVolver}
        className="inline-flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full transition duration-200"
        title="Volver atrás"
      >
        <span className="text-xl font-bold">←</span>
      </button>
    </div>
  )
}