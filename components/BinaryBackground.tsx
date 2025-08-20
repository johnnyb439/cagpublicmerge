export default function BinaryBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="text-dynamic-green font-mono text-lg leading-relaxed">
          {Array(30).fill(null).map((_, i) => (
            <div key={i} className="whitespace-nowrap">
              {Array(15).fill('01101000 01100101 01101100 01110000 00100000 ').join('')}
            </div>
          ))}
        </div>
      </div>
      {/* Scattered larger binary numbers */}
      <div className="absolute top-10 left-20 text-cyber-cyan opacity-20 font-mono text-4xl transform rotate-12">
        01010011
      </div>
      <div className="absolute top-40 right-32 text-dynamic-green opacity-20 font-mono text-3xl transform -rotate-6">
        11001010
      </div>
      <div className="absolute bottom-20 left-40 text-sky-blue opacity-20 font-mono text-5xl transform rotate-45">
        10110
      </div>
      <div className="absolute bottom-40 right-20 text-emerald-green opacity-20 font-mono text-3xl transform -rotate-12">
        01101110
      </div>
      <div className="absolute top-1/3 left-1/4 text-cyber-cyan opacity-20 font-mono text-2xl transform rotate-30">
        11100101
      </div>
      <div className="absolute top-2/3 right-1/3 text-dynamic-green opacity-20 font-mono text-4xl transform -rotate-20">
        00110111
      </div>
      <div className="absolute top-1/2 right-1/4 text-sky-blue opacity-20 font-mono text-3xl transform rotate-15">
        10101010
      </div>
      <div className="absolute bottom-1/3 left-1/3 text-emerald-green opacity-20 font-mono text-4xl transform -rotate-30">
        11110000
      </div>
    </div>
  );
}