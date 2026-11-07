import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface BmiCalculatorProps {
  onConsultTrainer: (bmiInfo: string) => void;
}

export const BmiCalculator: React.FC<BmiCalculatorProps> = ({ onConsultTrainer }) => {
  const [height, setHeight] = useState<string>('172');
  const [weight, setWeight] = useState<string>('70');
  const [age, setAge] = useState<string>('26');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [goal, setGoal] = useState<'muscle' | 'fat-loss' | 'endurance'>('muscle');

  const hMeters = parseFloat(height) / 100;
  const wKg = parseFloat(weight);

  let bmi: number | null = null;
  let category = '';
  let categoryColor = 'text-white';

  if (!isNaN(hMeters) && !isNaN(wKg) && hMeters > 0 && wKg > 0) {
    bmi = parseFloat((wKg / (hMeters * hMeters)).toFixed(1));
    if (bmi < 18.5) {
      category = 'Underweight (Hypertrophy & Strength Focus Recommended)';
      categoryColor = 'text-blue-400';
    } else if (bmi >= 18.5 && bmi < 24.9) {
      category = 'Optimal Range (Ideal for Progressive Resistance)';
      categoryColor = 'text-emerald-400';
    } else if (bmi >= 25 && bmi < 29.9) {
      category = 'Overweight (Targeted Cardio & Strength Conditioning)';
      categoryColor = 'text-yellow-400';
    } else {
      category = 'High BMI (Structured 1-on-1 Guidance Recommended)';
      categoryColor = 'text-[#ED101B]';
    }
  }

  const handleConsultClick = () => {
    const summary = `BMI Calculator Result: ${bmi || 'N/A'} (${category}) - Target: ${goal.toUpperCase()} (Height: ${height}cm, Weight: ${weight}kg)`;
    onConsultTrainer(summary);
  };

  return (
    <section className="relative py-20 lg:py-28 bg-[#080808] text-white border-t border-[#303030]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <span className="font-oswald text-xs font-bold uppercase tracking-widest text-[#ED101B] mb-2 block">
            INTERACTIVE FITNESS TOOL
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black uppercase text-white tracking-tight leading-[0.95] mb-3">
            ASSESS YOUR STATS. <span className="text-[#ED101B]">PLAN YOUR GOALS.</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1A1] leading-relaxed">
            Calculate your Body Mass Index and discuss your tailored workout routine with our trainers in Moshi.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="max-w-4xl bg-[#171717] border border-[#303030] rounded-md p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Input Controls */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5">
                    Gender
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`py-1.5 px-3 rounded text-xs font-oswald font-bold uppercase transition-colors ${
                        gender === 'male'
                          ? 'bg-[#ED101B] text-white'
                          : 'bg-[#222222] text-[#A1A1A1] border border-[#303030]'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`py-1.5 px-3 rounded text-xs font-oswald font-bold uppercase transition-colors ${
                        gender === 'female'
                          ? 'bg-[#ED101B] text-white'
                          : 'bg-[#222222] text-[#A1A1A1] border border-[#303030]'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="bmiGoalSelect" className="block text-[11px] font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5">
                    Goal
                  </label>
                  <select
                    id="bmiGoalSelect"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as any)}
                    className="w-full py-2 px-3 rounded bg-[#222222] border border-[#303030] text-xs font-oswald font-bold uppercase text-white focus:outline-none focus:border-[#ED101B]"
                  >
                    <option value="muscle">Muscle Building</option>
                    <option value="fat-loss">Fat Loss</option>
                    <option value="endurance">Endurance</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="heightSlider" className="text-xs font-oswald font-bold uppercase tracking-wider text-neutral-300">
                    Height
                  </label>
                  <span className="font-oswald text-sm font-bold text-white">
                    {height} cm
                  </span>
                </div>
                <input
                  id="heightSlider"
                  type="range"
                  min="130"
                  max="220"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full accent-[#ED101B] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="weightSlider" className="text-xs font-oswald font-bold uppercase tracking-wider text-neutral-300">
                    Weight
                  </label>
                  <span className="font-oswald text-sm font-bold text-white">
                    {weight} kg
                  </span>
                </div>
                <input
                  id="weightSlider"
                  type="range"
                  min="35"
                  max="160"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full accent-[#ED101B] cursor-pointer"
                />
              </div>

              <div className="w-1/2">
                <label htmlFor="ageInputNumber" className="block text-[11px] font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1">
                  Age (Years)
                </label>
                <input
                  id="ageInputNumber"
                  type="number"
                  min="14"
                  max="80"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full py-1.5 px-3 rounded bg-[#222222] border border-[#303030] text-white text-xs focus:outline-none focus:border-[#ED101B]"
                />
              </div>
            </div>

            {/* Results Dial */}
            <div className="lg:col-span-5 p-6 rounded bg-[#222222] border border-[#303030] text-center flex flex-col justify-between h-full">
              <div>
                <span className="font-oswald text-[10px] font-bold uppercase tracking-widest text-[#A1A1A1]">
                  BODY MASS INDEX
                </span>

                <div className="my-3">
                  <span className="font-display text-5xl font-black text-white tracking-tight">
                    {bmi || '--'}
                  </span>
                </div>

                <div className={`font-oswald text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded bg-[#171717] border border-[#303030] mb-4 ${categoryColor}`}>
                  {category || 'Enter details'}
                </div>

                <div className="text-left text-xs text-[#A1A1A1] space-y-1 mb-5">
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ED101B]" />
                    <span>Personalized workout routine available</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ED101B]" />
                    <span>Diet-plan support for your target</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConsultClick}
                className="w-full py-3 rounded text-xs font-oswald font-black uppercase tracking-wider text-white bg-[#ED101B] hover:bg-[#B9000B] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>DISCUSS PLAN WITH TRAINER</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
