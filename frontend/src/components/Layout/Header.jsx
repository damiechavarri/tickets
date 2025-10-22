export function Header({ event }) {
  return (
    <header className="relative">
      <div 
        className="bg-cover bg-center bg-no-repeat py-16 md:py-24"
        style={{ backgroundImage: `url(${event.image})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.name}</h1>
            <p className="font-bold mb-2">{event.info}</p>
            <p className="text-md md:text-lg text-blue-100">
              {event.date} • {event.time} • {event.location}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}