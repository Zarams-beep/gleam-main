const fortune = "Your positive energy will attract collaboration today 🌻";

export default function Fortune(){
    return(
        <div className="">
              <section className="p-4 rounded-2xl bg-gradient-to-r from-[#a855f7]/20 to-[#7e22ce]/10 border border-[#a855f7]/20 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1A1023] mb-2">🔮 Today’s Fortune</h2>
        <p className="text-gray-700 italic">{fortune}</p>
      </section>
        </div>
    )
}