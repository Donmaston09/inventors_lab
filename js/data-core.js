/* Inventor's Lab — core content: materials guide, volumes, science explainers, safety, badges */
(function () {
  "use strict";
  var INV = (window.INV = window.INV || {});

  /* Toolbox basics: assumed to be in every home, never listed per mission */
  INV.BASICS = ["scissors (child-safe)", "sticky tape", "pencil", "felt-tips", "ruler"];

  /* Household Materials Guide. n = exact name used in missions. x = needs buying (not usually found at home) */
  INV.MATS = [
    { n: "cereal box", e: "📦", c: "card", t: "Flatten it. The thin card is perfect for panels, wings and signs." },
    { n: "cardboard box", e: "📦", c: "card", t: "Delivery boxes are best. Thick corrugated card makes strong bodies and bases." },
    { n: "pizza box", e: "🍕", c: "card", t: "Strong, flat and already folded. Great for boards and ovens." },
    { n: "egg box", e: "🥚", c: "card", t: "The cups make feet, eyes, wheels' hubs and bumpers." },
    { n: "toilet roll tube", e: "🧻", c: "card", t: "Robot bodies, legs, towers, and rollers. Save lots of them!" },
    { n: "kitchen roll tube", e: "🧻", c: "card", t: "Longer and stronger than a toilet roll tube. Good for rails and poles." },
    { n: "paper cups", e: "🥤", c: "card", t: "Robot heads, buckets and gondolas. Keep them clean and dry." },
    { n: "paper plates", e: "🍽️", c: "card", t: "Light, round and flat: spinners, wheels, shields and drums." },
    { n: "newspaper", e: "📰", c: "card", t: "Roll it into stiff tubes, or scrunch it into balls for padding." },
    { n: "thin card", e: "🃏", c: "card", t: "Old greetings cards or cereal-box card. Cut into strips, gears and wings." },
    { n: "paper", e: "📄", c: "card", t: "Plain or scrap paper for folding, rolling and testing." },
    { n: "tissue paper", e: "🌸", c: "card", t: "Very light. Good for parachutes, kites and wings." },
    { n: "carrier bag", e: "🛍️", c: "plastic", t: "Cut it open for a parachute canopy. Never play with bags near your face." },
    { n: "bin bag", e: "🗑️", c: "plastic", t: "A big, light, waterproof sheet. Perfect for sails and parachutes." },
    { n: "bottle caps", e: "🔵", c: "plastic", t: "The inventor's best friend: wheels, buttons, eyes and gears. Wash and dry them." },
    { n: "plastic bottle", e: "🧴", c: "plastic", t: "Rinsed, empty bottles make bodies, boats, rockets and water tanks." },
    { n: "yoghurt pots", e: "🍦", c: "plastic", t: "Cups for wind catchers, buckets and robot hats." },
    { n: "plastic lids", e: "⭕", c: "plastic", t: "Margarine and ice-cream tub lids make big, light wheels." },
    { n: "plastic cups", e: "🥛", c: "plastic", t: "Reusable cups for water experiments and robot bodies." },
    { n: "drinking straws", e: "🥤", c: "plastic", t: "Straight, light and hollow. Axle holders, rails, rockets and frames." },
    { n: "old CD", e: "💿", c: "plastic", t: "Ask a grown-up for one you no longer need. Smooth and flat: wheels and hover discs." },
    { n: "balloons", e: "🎈", c: "plastic", t: "Air power. Grown-ups blow up for under 8s, and never chew bits of burst balloon." },
    { n: "sponge", e: "🧽", c: "plastic", t: "Squishy! Springs, pads, bumpers, and stamps." },
    { n: "bubble wrap", e: "🫧", c: "plastic", t: "Cushions for landings and crash tests." },
    { n: "jar lid", e: "🥫", c: "plastic", t: "A big, strong wheel or turntable. Check no sharp edges." },
    { n: "lolly sticks", e: "🪵", c: "bits", t: "Strong, flat levers and legs. You can buy a bag of 100 for very little." },
    { n: "wooden skewers", e: "🥢", c: "bits", t: "Axles and masts. A grown-up must snip off the sharp points first." },
    { n: "pipe cleaners", e: "🧶", c: "bits", t: "Bendy legs, antennae and hooks. Ends can be sharp; fold them over." },
    { n: "paper clips", e: "📎", c: "bits", t: "Hooks, hinges and electric switch contacts." },
    { n: "cotton reels", e: "🧵", c: "bits", t: "Old wooden reels make great pulleys and winders." },
    { n: "clothes pegs", e: "📌", c: "bits", t: "Grippers, clamps, and the middle of a door alarm." },
    { n: "twigs", e: "🌿", c: "bits", t: "Collect fallen ones outside. Free poles, masts and levers." },
    { n: "garden canes", e: "🎋", c: "bits", t: "Long, light poles for outdoor builds. Cap the ends with bottle tops or tape." },
    { n: "leaves", e: "🍃", c: "bits", t: "Fallen leaves from the garden or park. Free, and great for tiny boats and sails." },
    { n: "stones", e: "🪨", c: "bits", t: "Weights and anchors. Choose smooth ones about the size of an egg." },
    { n: "marbles", e: "🔮", c: "bits", t: "Rolling stars. Never for children under 3 nearby, as they are a choking risk." },
    { n: "coins", e: "🪙", c: "bits", t: "Handy equal weights. Coins are all the same, so tests are fair." },
    { n: "beads", e: "📿", c: "bits", t: "Small round weights, wheels and decorations. Keep away from little ones." },
    { n: "buttons", e: "🔘", c: "bits", t: "Wheels, eyes and gear hubs." },
    { n: "fabric scraps", e: "🧣", c: "bits", t: "Sails, flags, capes and soft pads." },
    { n: "books", e: "📚", c: "bits", t: "Heavy, flat and perfect for bridge supports and ramps." },
    { n: "toy car", e: "🚙", c: "bits", t: "A small toy for testing ramps, bridges and tunnels." },
    { n: "masking tape", e: "🩹", c: "join", t: "Peels off easily. Great for trying a design before fixing it for real." },
    { n: "PVA glue", e: "🧴", c: "join", t: "Strong white glue. Needs a few minutes (or an hour) to dry. Be patient!" },
    { n: "glue stick", e: "🖍️", c: "join", t: "Good for paper and thin card." },
    { n: "split pins", e: "📍", c: "join", t: "Also called paper fasteners. They make moving joints and hinges." },
    { n: "string", e: "🪢", c: "join", t: "Pulls, hangs and lifts. Keep short pieces away from small children and pets." },
    { n: "wool", e: "🧶", c: "join", t: "Soft string. Good for belts, tails and zip lines." },
    { n: "rubber bands", e: "➰", c: "join", t: "Stored energy! Springs, tyres, belts and motors." },
    { n: "sticky tack", e: "🟦", c: "join", t: "Reusable putty. Holds things while you test. Also protects tables when poking holes." },
    { n: "googly eyes", e: "👀", c: "deco", t: "Instant character! Stick on with PVA." },
    { n: "pom-poms", e: "🔴", c: "deco", t: "Soft and light: perfect, safe, 'ammo' for launchers." },
    { n: "paint", e: "🎨", c: "deco", t: "Poster paint makes cardboard look like metal, fur or scales. Wear an apron!" },
    { n: "stickers", e: "⭐", c: "deco", t: "Buttons, badges and dials." },
    { n: "aluminium foil", e: "🪞", c: "deco", t: "Looks like metal AND conducts electricity. Handy for switches." },
    { n: "baking soda", e: "🥄", c: "kitchen", t: "Bicarbonate of soda. Fizzes with vinegar. Never eat the experiments." },
    { n: "vinegar", e: "🍶", c: "kitchen", t: "Fizzes with baking soda. Keep out of eyes." },
    { n: "water", e: "💧", c: "kitchen", t: "From the tap. Do experiments in a tray to catch spills." },
    { n: "food colouring", e: "🌈", c: "kitchen", t: "Makes water easy to see. It can stain, so use a tray." },
    { n: "cooking oil", e: "🫒", c: "kitchen", t: "A little goes a long way. Great for slippery and slow-flow tests." },
    { n: "salt", e: "🧂", c: "kitchen", t: "Dissolves in water, and makes it more floaty." },
    { n: "dried pasta", e: "🍝", c: "kitchen", t: "Tubes and shapes for building and rolling. Not to be eaten after building!" },
    { n: "rice", e: "🍚", c: "kitchen", t: "Pour it to make weights and tests fair." },
    { n: "bowl", e: "🥣", c: "kitchen", t: "For water tests and sorting parts." },
    { n: "tray", e: "🍱", c: "kitchen", t: "A baking or lunch tray keeps wet experiments tidy." },
    { n: "jug", e: "🫗", c: "kitchen", t: "For pouring water carefully." },
    { n: "ice cubes", e: "🧊", c: "kitchen", t: "For slippery-surface tests." },
    { n: "timer", e: "⏱️", c: "kitchen", t: "A kitchen timer or a grown-up's phone stopwatch." },
    { n: "torch", e: "🔦", c: "kitchen", t: "A bright light for shadows and light-sensor tests." },
    { n: "solar garden light", e: "🌞", c: "kitchen", t: "An old one that no longer needs to work in the garden. Its sensor switches an LED on in the dark." },
    /* Extras: not usually at home. A starter pack costs roughly £10–£15 from hobby shops or online. Salvage from old toys with a grown-up. */
    { n: "hobby motor (3V)", e: "⚙️", c: "electric", x: 1, t: "A small 1.5–3V motor. Often salvaged from old toys by a grown-up." },
    { n: "battery holder (2×AA)", e: "🔋", c: "electric", x: 1, t: "A plastic box for two AA batteries, with wires. Gives 3 volts." },
    { n: "AA batteries", e: "🔋", c: "electric", x: 1, t: "Two ordinary AA batteries. Never use coin or button batteries, as they are dangerous if swallowed." },
    { n: "mini switch", e: "🔘", c: "electric", x: 1, t: "A tiny slide switch. Or make your own from a paper clip and a split pin!" },
    { n: "LED (3V)", e: "💡", c: "electric", x: 1, t: "Pick one that already has its resistor built in ('3V LED'), or ask a grown-up to add one." },
    { n: "buzzer (3V)", e: "🔔", c: "electric", x: 1, t: "A small 3V buzzer. The red wire goes to plus (+)." },
    { n: "crocodile clip leads", e: "🐊", c: "electric", x: 1, t: "Wires with clips on both ends. Quick joins, no soldering." },
    { n: "syringes (no needles)", e: "💉", c: "electric", x: 1, t: "Plastic oral syringes from a pharmacy (no needles, ever)." },
    { n: "plastic tubing", e: "🧪", c: "electric", x: 1, t: "Thin bendy tube (aquarium air line) that fits snugly on the syringe tip." },
    { n: "brain board (micro:bit)", e: "🧠", c: "electric", x: 1, t: "A small programmable board like a BBC micro:bit. Optional: for when you are ready to code." },
    { n: "servo motor", e: "🦾", c: "electric", x: 1, t: "A small motor that turns to an exact angle. Optional, with the brain board." }
  ];
  INV.MAT = {}; INV.MATS.forEach(function (m) { INV.MAT[m.n] = m; });
  INV.MAT_CATS = { card: "Card & paper", plastic: "Plastic & bottles", bits: "Sticks, bits & bobs", join: "Sticking & joining", deco: "Decorating", kitchen: "Kitchen & experiments", electric: "Little extras (optional)" };

  INV.VOLS = [
    { n: 1, t: "Inventor Foundations", s: "First builds from scratch", e: "🧰", c: "#ff8a3d", age: "5+", sk: ["cut & fold", "strong shapes", "wheels & axles", "balance"], d: "Your very first builds. Fold, roll, join and balance. No experience needed, just curiosity!" },
    { n: 2, t: "Robots & Creatures", s: "Bring cardboard to life", e: "🤖", c: "#ef476f", age: "5+", sk: ["moving parts", "pull strings", "legs & wings", "character"], d: "Build walking, flapping, snapping robots and creatures that move in surprising ways." },
    { n: 3, t: "Vehicles & Motion Machines", s: "Things that go", e: "🚗", c: "#3a86ff", age: "6+", sk: ["wheels", "air & wind power", "rubber bands", "motors"], d: "Cars, boats, sailers, hovercraft and tanks, all powered by air, wind, bands or motors." },
    { n: 4, t: "Machines & Mechanisms Workshop", s: "Levers, gears, cams & pulleys", e: "⚙️", c: "#8338ec", age: "7+", sk: ["gears", "levers", "cams", "pulleys & linkages"], d: "The secret parts inside every machine. Build each one, then see how they work together." },
    { n: 5, t: "Design, Test & Invent Your Own", s: "Make it yours", e: "💡", c: "#d99a00", age: "7+", sk: ["design process", "fair testing", "improving", "free invention"], d: "Plan, build, test, improve. Real inventors do it over and over. Then invent from your own imagination." },
    { n: 6, t: "STEM Experiments & Engineering Challenges", s: "Test it. Measure it. Beat it.", e: "🔬", c: "#06a77d", age: "7+", sk: ["forces", "structures", "air & water", "measuring"], d: "Challenges with a clear goal and a score. Can you build the strongest, fastest, lightest, tallest?" },
    { n: 7, t: "Motors, Batteries & Circuits", s: "Make it move by itself", e: "⚡", c: "#f15bb5", age: "8+", sk: ["circuits", "switches", "motors", "gear-down"], d: "Light LEDs, spin fans and drive buggies. A grown-up checks every circuit before you switch on." },
    { n: 8, t: "Sensors & Control", s: "Make it sense and decide", e: "🎛️", c: "#00a8cc", age: "8+", sk: ["sensors", "switches", "logic", "feedback"], d: "Machines that notice the world: tilt, squeeze, bump and light, and then act on it." },
    { n: 9, t: "Outdoor Engineering Missions", s: "Take it outside", e: "🌳", c: "#4f9a28", age: "6+", sk: ["wind & water", "big builds", "weather", "teamwork"], d: "Wind spinners, water wheels, zip lines and parachutes. Use the weather and the garden as your lab." },
    { n: 10, t: "Master Inventor Lab", s: "Put it all together", e: "🏆", c: "#2b2d42", age: "9+", sk: ["combining systems", "planning", "portfolio", "show & tell"], d: "Big projects that combine everything you know. Plan them, build them, then show them off." }
  ];

  /* "Understand" explainers keyed by model.science */
  INV.SCI = {
    vibration: { t: "Vibration", big: ["vibration", "off-centre", "friction"], say: "When something spins with a heavy bit on one side, it shakes. Shaking the legs makes them shuffle along the table, a bit like a ticklish creature.", look: "Watch the lump on the motor shaft. Which way does the bot go when you change the legs?", tests: ["Move the lump closer to the motor. Does it shake more or less?", "Make the legs longer or shorter. Which goes furthest in 10 seconds?", "Bend the leg tips forwards, then backwards. What happens?"] },
    cam: { t: "Cams", big: ["cam", "follower", "rotation"], say: "A cam is a wheel that is NOT round, or not centred. When it turns, it pushes a rod up and down. Different shapes make different movements.", look: "Find the spot on the cam that touches the rod. When is the rod highest?", tests: ["Make an egg-shaped cam. Does the rod move the same way?", "Move the hole nearer the middle. Does the rod move less?", "Add a second cam on the same shaft, turned half a turn. What do two followers do?"] },
    lever: { t: "Levers", big: ["lever", "fulcrum", "effort", "load"], say: "A lever is a stiff bar that turns on a pivot called the fulcrum. Push down on one side and the other side goes up. Move the fulcrum and the lever feels different!", look: "Where is the fulcrum? Which end moves furthest?", tests: ["Move the fulcrum closer to the load. Is it easier to lift?", "Make the arm longer on the throwing side. Does it throw further?", "Change the pom-pom for something heavier. What happens?"] },
    linkage: { t: "Linkages", big: ["linkage", "pivot", "crank"], say: "Linkages are bars joined by pins that turn movement into a different movement. A crank turns round and round, but a rod can make it push and pull in a straight line.", look: "Follow the pin on the crank. Where does the other end of the rod go?", tests: ["Move the crank pin further from the middle. How far does the slider travel?", "Make the connecting rod longer. What changes?", "Count turns of the crank for one flap, step or slide."] },
    hydraulics: { t: "Hydraulics", big: ["hydraulics", "pressure", "fluid"], say: "Water cannot be squashed. So when you push water in at one end of a tube, the same amount has to come out at the other end and it pushes whatever is there. That is how diggers work!", look: "Push the controller syringe 2 cm. How far does the other plunger move?", tests: ["Use a big syringe to push a small one. What happens to the force?", "Add a little air to the tube. Does the arm still move smoothly?", "Make the arm longer. Does it lift less?"] },
    air: { t: "Air power", big: ["thrust", "pressure", "reaction"], say: "Squashed air wants to get out. When it rushes backwards through a nozzle, it pushes the machine forward. For every action there is an equal and opposite reaction.", look: "Watch where the air leaves. Which way does the machine go?", tests: ["Use a wider straw. Does it go further, or less far?", "Make the car lighter. Does it go further?", "Time it over 2 metres. Can you beat your best?"] },
    energy: { t: "Stored energy", big: ["energy", "elastic", "potential"], say: "Stretching, twisting or lifting something stores energy. When you let it go, the energy turns into movement. A wound-up rubber band is like a tiny battery.", look: "How many winds can you give it? Does more winding mean more distance?", tests: ["Wind it 10, 20 and 30 times. Measure how far it goes each time.", "Try a thicker rubber band. Is it better or worse?", "Make the wheels bigger. What changes?"] },
    gear: { t: "Gears", big: ["gear", "ratio", "teeth", "torque"], say: "Gears are wheels with teeth that lock together. A small gear turning a big gear makes it turn slowly but with more strength. A big gear turning a small one makes it spin fast.", look: "Count the teeth on both gears. Turn one once. How many turns does the other do?", tests: ["Swap the gears so big drives small. Does it get faster or slower?", "Add a third gear in the middle. Which way does the last gear turn?", "Count how many turns of the handle for 1 turn of the last gear."] },
    wind: { t: "Wind power", big: ["wind", "force", "drag"], say: "Moving air pushes on anything in its way. A big, flat sail catches more wind, so it feels a bigger push. Cups and sails turn that push into movement.", look: "Which way is the wind blowing? Which side of the sail does it push?", tests: ["Make the sail bigger. Does the machine go faster?", "Try a different angle. What angle is best?", "Use a hairdryer on a cool setting or a fan (grown-up in charge)."] },
    friction: { t: "Friction & grip", big: ["friction", "grip", "traction"], say: "Friction is the rubbing force between two things. Rough surfaces grip well; slippery ones slide. Tracks and tyres have bumps that grip the ground.", look: "What is the track made from? Is it smooth or bumpy?", tests: ["Test on carpet, wood, and a tray with a little oil. Where does it grip best?", "Add rubber bands as grips. Does it climb steeper hills?", "Make the tracks wider. What happens?"] },
    pulley: { t: "Pulleys", big: ["pulley", "rope", "load", "effort"], say: "A pulley is a wheel with a rope over it. It changes the direction of your pull, so you can lift something up by pulling down. More ropes sharing the load make it easier.", look: "Count the ropes holding up the load. How far must you pull to lift it 1 cm?", tests: ["Add a second pulley. Is it easier to lift?", "Try a bigger and a smaller wheel. Which works best?", "Add more weight. At what point does it stick?"] },
    ratchet: { t: "Ratchets", big: ["ratchet", "pawl", "one-way"], say: "A ratchet lets something turn one way but not the other. A tooth-shaped wheel and a small hook (the pawl) click round, and the pawl stops it going backwards.", look: "Which way does it turn easily? Which way does it lock?", tests: ["Add more teeth. Does it click more often?", "Make the pawl longer. What happens?", "Use the ratchet to wind a string. Does it hold a load?"] },
    belt: { t: "Belt drives", big: ["belt", "pulley", "ratio"], say: "A belt joins two wheels so one can drive the other without touching. Different sized wheels change speed: the small wheel turns many times for each turn of the big one.", look: "Which wheel is the driver? Which turns slower?", tests: ["Swap which wheel you turn by hand. What changes?", "Cross the belt into a figure of 8. Which way does the second wheel turn?", "Make the belt looser. When does it start to slip?"] },
    circuit: { t: "Circuits", big: ["circuit", "voltage", "current", "switch"], say: "Electricity needs a full loop to flow: out of the battery, through wires and parts, and back in. A switch is a gap you can open or close. Open gap = no flow.", look: "Trace the loop with your finger. Where is the switch?", tests: ["Swap the battery wires round. What happens to the motor or LED?", "Add a second LED beside the first (in parallel). Are both bright?", "Take out one wire. Does anything still work?"] },
    switch: { t: "Switches & sensors", big: ["switch", "contact", "sensor"], say: "A sensor is a switch that something in the world can flip: a tilt, a squeeze, a bump. When the contacts touch, the circuit closes and something happens.", look: "Where do the two metal contacts touch? What makes them touch?", tests: ["Make the gap smaller. Is it more sensitive?", "Make the contacts bigger. Is it easier to trigger?", "What should NOT trigger it? Test a gentle shake."] },
    light: { t: "Light sensing", big: ["sensor", "light", "output"], say: "A light sensor notices how bright it is. It can switch something on when it gets dark, like a street lamp. Sensors are the senses of a machine; LEDs and motors are its actions.", look: "Cover the sensor with your hand. What happens to the LEDs?", tests: ["Test it in a cupboard, then under a torch. Where does it switch?", "How dim does it have to be before the LEDs come on?", "Cover half the sensor. Does it still work?"] },
    structure: { t: "Strong structures", big: ["structure", "triangle", "compression", "tension"], say: "Triangles are the strongest shape in building: they cannot squash sideways like squares can. Parts being squeezed are in compression; parts being stretched are in tension.", look: "Find the triangles. Which bars are being squashed? Which are being stretched?", tests: ["Add one diagonal to a square. Does it stop wobbling?", "Test the same bridge flat, then folded. How much more can it carry?", "Which bar breaks first when you overload it?"] },
    drag: { t: "Air resistance", big: ["air resistance", "drag", "gravity"], say: "Gravity pulls everything down. But air pushes back against anything falling, and a big, wide shape like a parachute catches lots of air. So it falls more slowly.", look: "Which falls first, the weight or the parachute? Why?", tests: ["Make the canopy twice as big. How much slower does it fall?", "Cut a small hole in the top. What does it do to the sway?", "Add a heavier passenger. Does it still float down gently?"] },
    control: { t: "Control", big: ["input", "decision", "output", "feedback"], say: "A robot has three jobs: sense, think and act. Sensors are the input, the brain decides, and motors or lights are the output. If it looks again after acting, that is feedback.", look: "What does it sense? What does it decide? What does it do?", tests: ["Draw its sense-think-act loop on paper.", "Change what happens when it sees an obstacle.", "What if the sensor is blocked? What should it do?"] }
  };
  INV.SIMS = { gear: "gear", lever: "lever", pulley: "pulley", circuit: "circuit", switch: "circuit", belt: "belt" };

  INV.SAFETY = [
    { e: "👩‍👧", t: "A grown-up is the Safety Officer", d: "Always have a grown-up nearby for under-8s, and for anything marked with the grown-up badge. They help with cutting thick card, poking holes and every circuit." },
    { e: "✂️", t: "Cutting and gluing", d: "Children use child-safe scissors. Craft knives, saws and hot glue are for grown-ups only. Snip the sharp points off skewers before use, and fold over sharp pipe-cleaner ends." },
    { e: "🔋", t: "Batteries: AA only, 3 volts only", d: "Use ordinary AA or AAA batteries in a holder: never more than 3 volts (two AA). NEVER use coin or button batteries; they are very dangerous if swallowed. Never use plug sockets, chargers or mains electricity in any build." },
    { e: "⚡", t: "No short circuits", d: "Never join the battery's + and − with a bare wire. It gets very hot very quickly. Switch off when you are not testing, and take batteries out when you are finished." },
    { e: "🧲", t: "Small parts and magnets", d: "Keep beads, marbles, caps and balloons away from little brothers and sisters. Do not use loose magnets in builds." },
    { e: "🎈", t: "Balloons", d: "Grown-ups blow up balloons for under-8s. Never chew a balloon, and throw away burst pieces straight away. Take care if anyone is latex-allergic." },
    { e: "🥽", t: "Launchers", d: "Only fire soft things like pom-poms. Never aim at faces, people or pets. Wear safety glasses when testing fast or springy builds." },
    { e: "💧", t: "Water and outdoors", d: "Do water tests in a tray or outside. Stay away from roads, ponds and rivers unless a grown-up is right beside you. Wear sunscreen and a hat on sunny days." },
    { e: "🧪", t: "Kitchen experiments", d: "Never taste or drink an experiment. Keep vinegar out of eyes. Wash hands afterwards. Do not take apart old toys or any battery pack without a grown-up." },
    { e: "♻️", t: "Clean and recycle", d: "Rinse bottles and tubs. Never use anything that held chemicals or cleaning products. Put leftovers back in the recycling when you finish." }
  ];

  /* Rotating prompts for the Idea Spinner (Invent Studio) */
  INV.SPIN = {
    problem: ["keep a pet cool", "carry a snack across the room", "wake up a sleepy grown-up", "guard your bedroom door", "rescue a toy stuck on a shelf", "water a plant while you are away", "stop a toy rolling off a table", "keep drinks cold on a picnic", "tell you when it is bedtime", "make washing-up more fun", "lift something heavy with no muscles", "send a message across the garden", "protect an egg from a big fall", "sort coins by size", "make a rainy day more exciting"],
    mech: ["a lever", "wheels and axles", "a pulley", "a rubber band", "a balloon", "a crank handle", "gears", "a ramp", "a cam", "a simple circuit", "a tilt switch", "a pressure pad", "a sail or wind catcher", "a flap or hinge", "a string and pulley"],
    mat: ["only cardboard tubes", "bottle caps and straws", "a cereal box", "paper cups", "lolly sticks and rubber bands", "a pizza box", "an egg box", "plastic bottles", "newspaper and tape", "paper plates", "string and pegs", "an old CD", "tubs and lids", "foil and card", "junk from the recycling bin"]
  };

  /* Badges. Computed from progress in app.js */
  INV.BADGES = [
    { id: "first", e: "🌱", t: "First Spark", d: "Finish your first build." },
    { id: "b5", e: "📦", t: "Cardboard Cadet", d: "Finish 5 builds." },
    { id: "b15", e: "🔧", t: "Builder", d: "Finish 15 builds." },
    { id: "b40", e: "🛠️", t: "Engineer", d: "Finish 40 builds." },
    { id: "b100", e: "🏗️", t: "Master Builder", d: "Finish 100 builds." },
    { id: "u10", e: "🧠", t: "Thinker", d: "Understand 10 missions." },
    { id: "i10", e: "💡", t: "Inventor", d: "Invent on 10 missions." },
    { id: "q10", e: "⚡", t: "Quick-build Hero", d: "Finish 10 builds of 15 minutes or less." },
    { id: "o5", e: "🌳", t: "Outdoor Explorer", d: "Finish 5 outdoor missions." },
    { id: "e5", e: "🔌", t: "Spark Maker", d: "Finish 5 builds with a motor, LED or buzzer." },
    { id: "t5", e: "👨‍👩‍👧", t: "Team Builder", d: "Finish 5 builds-together missions." },
    { id: "s10", e: "⭐", t: "Triple Star", d: "Finish Build, Understand AND Invent on 10 missions." }
  ];
})();

/* Optional real build videos. Add entries like "v3-04": "videos/v3-04.mp4" (files you film yourself and host beside the app). */
INV.VIDEOS = INV.VIDEOS || {};
