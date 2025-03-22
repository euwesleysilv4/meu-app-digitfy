<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-[1400px] mx-auto px-4">
  {/* Ajustei a largura máxima do container para 1400px */}
  
  {plans.map((plan, index) => (
    <motion.div
      key={plan.name}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      className="relative flex flex-col h-full min-w-[300px]" 
      // Aumentei a largura mínima dos cards para 300px
    >
      {/* ... resto do código do card permanece igual ... */}
    </motion.div>
  ))}
</div> 