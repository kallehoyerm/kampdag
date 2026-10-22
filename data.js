/* Kampdags startdata. Grader er spillets redaktionelle skøn over svarenes hyppighed. */
(function () {
  const spiller = (navn, aliaser = []) => ({ navn, aliaser, grad: 1 });
  const pools = {
    pl: ["Alan Shearer","Thierry Henry","Wayne Rooney","Frank Lampard","Steven Gerrard","N’Golo Kanté","Ryan Giggs","Paul Scholes","Sergio Agüero","Harry Kane","Mohamed Salah","Kevin De Bruyne","Cristiano Ronaldo","David Beckham","Eric Cantona","Dennis Bergkamp","Didier Drogba","Patrick Vieira","Tony Adams","John Terry","Cesc Fàbregas","Robin van Persie","Luis Suárez","Son Heung-min","Jürgen Klinsmann","Petr Čech","Ruud van Nistelrooy","Roy Keane","Michael Owen","Jamie Vardy","Gareth Bale"],
    dansk: ["Peter Schmeichel","Kasper Schmeichel","Christian Eriksen","Michael Laudrup","Brian Laudrup","Preben Elkjær","Allan Simonsen","Jon Dahl Tomasson","Thomas Sørensen","Daniel Agger","Simon Kjær","Nicklas Bendtner","Christian Poulsen","Thomas Gravesen","Jesper Grønkjær","Martin Jørgensen","Pierre-Emile Højbjerg","Andreas Christensen","Joachim Andersen","Rasmus Højlund","Morten Hjulmand","Kasper Dolberg","Yussuf Poulsen","Thomas Delaney","Nicolai Jørgensen","Lars Jacobsen","Dennis Rommedahl","Martin Braithwaite","Søren Lerby","Jan Mølby"],
    laliga: ["Lionel Messi","Cristiano Ronaldo","Xavi","Andrés Iniesta","Sergio Ramos","Karim Benzema","Luka Modrić","Antoine Griezmann","Zinedine Zidane","Ronaldinho","Rivaldo","Luis Suárez","Neymar","Iker Casillas","Raúl","David Villa","Fernando Torres","Sergio Busquets","Carles Puyol","Gerard Piqué","Toni Kroos","Gareth Bale","Diego Maradona","Samuel Eto'o","Johan Cruyff","Ronaldo Nazário","Thibaut Courtois","Dani Alves","Hugo Sánchez","Radamel Falcao"],
    seriea: ["Paolo Maldini","Francesco Totti","Alessandro Del Piero","Andrea Pirlo","Gianluigi Buffon","Zlatan Ibrahimović","Ronaldo Nazário","Kaká","Rui Costa","Roberto Baggio","Gennaro Gattuso","Franco Baresi","Javier Zanetti","Diego Maradona","Gabriel Batistuta","Christian Vieri","Filippo Inzaghi","Alessandro Nesta","Clarence Seedorf","Edinson Cavani","Lautaro Martínez","Gonzalo Higuaín","Ciro Immobile","Romelu Lukaku","Dida","Cafu","Thiago Silva","Daniele De Rossi","Pavel Nedvěd","George Weah"],
    bundesliga: ["Franz Beckenbauer","Gerd Müller","Karl-Heinz Rummenigge","Lothar Matthäus","Miroslav Klose","Oliver Kahn","Manuel Neuer","Thomas Müller","Robert Lewandowski","Arjen Robben","Franck Ribéry","Jürgen Klinsmann","Marco Reus","Erling Haaland","Jadon Sancho","Toni Kroos","Bastian Schweinsteiger","Philipp Lahm","Mats Hummels","Pierre-Emerick Aubameyang","Rudi Völler","Uwe Seeler","Claudio Pizarro","Kevin Keegan","Giovane Élber","Stefan Effenberg","Michael Ballack","Lukas Podolski","Andreas Brehme","Rafinha"],
    traenere: ["Alex Ferguson","Pep Guardiola","José Mourinho","Carlo Ancelotti","Arsène Wenger","Jürgen Klopp","Arrigo Sacchi","Johan Cruyff","Brian Clough","Marcello Lippi","Vicente del Bosque","Ottmar Hitzfeld","Bob Paisley","Louis van Gaal","Fabio Capello","José Villalonga","Didier Deschamps","Zinedine Zidane","Diego Simeone","Thomas Tuchel","Carlo Mazzone","Nils Arne Eggen","Morten Olsen","Richard Møller Nielsen","Sepp Piontek","Åge Hareide","Ebbe Skovdahl","Ståle Solbakken","Brian Laudrup","Bo Henriksen"],
    stadioner: ["Wembley Stadium","Old Trafford","Anfield","Emirates Stadium","Stamford Bridge","Etihad Stadium","Camp Nou","Santiago Bernabéu","Metropolitano","San Siro","Stadio Olimpico","Allianz Stadium","Signal Iduna Park","Allianz Arena","Olympiastadion Berlin","Parken","Brøndby Stadion","MCH Arena","Ceres Park","Nature Energy Park","JYSK Park","Villa Park","St James’ Park","Goodison Park","Tottenham Hotspur Stadium","Estádio da Luz","Johan Cruyff Arena","Maracanã","Azteca","Lusail Stadium"],
    klubber: ["FC København","Brøndby IF","FC Midtjylland","AGF","AaB","OB","Silkeborg IF","Viborg FF","Randers FC","Esbjerg fB","FC Nordsjælland","Vejle Boldklub","Sønderjyske","Lyngby BK","Hvidovre IF","B 1903","Kjøbenhavns Boldklub","Frem","B 93","AB","Kolding IF","Hobro IK","Næstved BK","Ikast FS","Herfølge Boldklub"],
    champions: ["Real Madrid","AC Milan","Bayern München","Liverpool","Barcelona","Ajax","Manchester United","Inter","Juventus","Benfica","Chelsea","Porto","Nottingham Forest","Borussia Dortmund","Celtic","Feyenoord","Aston Villa","Hamburger SV","Steaua București","Marseille","Manchester City","Paris Saint-Germain","Arsenal","Atlético Madrid","Roma","Valencia","Tottenham Hotspur","Leeds United","Red Star Belgrade","PSV Eindhoven"],
    landshold: ["Brasilien","Tyskland","Italien","Argentina","Frankrig","Uruguay","England","Spanien","Nederlandene","Kroatien","Portugal","Belgien","Danmark","Sverige","Ungarn","Tjekkiet","Polen","Schweiz","Mexico","USA","Japan","Sydkorea","Marokko","Kamerun","Senegal","Nigeria","Chile","Colombia","Australien","Grækenland"]
  };
  const trivia = {
    pl: "Premier League begyndte i 1992 og har haft spillere fra hele verden.", dansk: "Danmark vandt EM i 1992 efter at være kommet med kort før turneringen.", laliga: "La Liga blev grundlagt i 1929.", seriea: "Serie A fik sin nuværende landsdækkende ligastruktur i 1929.", bundesliga: "Bundesligaen blev etableret i 1963.", traenere: "Flere af historiens mest vindende trænere har arbejdet i flere forskellige lande.", stadioner: "Parken åbnede i 1992 og er Danmarks nationalstadion.", klubber: "Kjøbenhavns Boldklub blev stiftet i 1876.", champions: "Turneringen begyndte i 1955 som Europa Cuppen for mesterhold.", landshold: "VM for mænd blev spillet første gang i 1930."
  };
  const prompts = [
    ["pl","Nævn en spiller, der har spillet i Premier League"],["pl","Hvilken tidligere Premier League-spiller kan du komme i tanke om?"],["pl","Nævn en målscorer fra Premier League"],["pl","Nævn en Premier League-profil fra historien"],
    ["dansk","Nævn en dansk fodboldspiller, der har spillet i udlandet"],["dansk","Hvilken dansk landsholdsspiller fra en udenlandsk klub kender du?"],["dansk","Nævn en dansk spiller med en international klubkarriere"],["dansk","Tænk på dansk fodboldhistorie: nævn en spiller fra udlandet"],
    ["laliga","Nævn en spiller, der har spillet i La Liga"],["laliga","Nævn en tidligere La Liga-profil"],["laliga","Hvilken spiller fra spansk ligafodbold kan du nævne?"],["laliga","Nævn en profil fra La Liga"],
    ["seriea","Nævn en spiller, der har spillet i Serie A"],["seriea","Hvilken tidligere Serie A-profil kommer du i tanke om?"],["seriea","Nævn en spiller fra italiensk ligafodbold"],["seriea","Nævn en profil fra Serie A"],
    ["bundesliga","Nævn en spiller, der har spillet i Bundesligaen"],["bundesliga","Hvilken tidligere Bundesliga-profil kan du nævne?"],["bundesliga","Nævn en spiller fra tysk ligafodbold"],["bundesliga","Nævn en profil fra Bundesligaen"],
    ["traenere","Nævn en fodboldtræner med en international karriere"],["traenere","Hvilken kendt landstræner eller klubtræner kan du nævne?"],["traenere","Nævn en træner, der har vundet store titler"],["traenere","Tænk på fodboldhistorien: nævn en træner"],
    ["stadioner","Nævn et fodboldstadion"],["stadioner","Hvilket kendt stadion har lagt græs til store kampe?"],["stadioner","Nævn et stadion fra international fodbold"],["stadioner","Nævn et stadion, hvor der er spillet landskampe"],
    ["klubber","Nævn en dansk fodboldklub"],["klubber","Hvilken klub har spillet i den danske Superliga?"],["klubber","Nævn en historisk dansk fodboldklub"],["klubber","Hvilken dansk klub kender du fra ligafodbold?"],
    ["champions","Nævn en klub, der har spillet i Champions League eller Europa Cuppen"],["champions","Hvilken klub fra Champions League-historien kan du nævne?"],["champions","Nævn en klub, der har deltaget i Europa Cuppen for mesterhold"],["champions","Tænk på Champions League-historien: nævn en klub"],
    ["landshold","Nævn et land, der har spillet VM-slutrunde"],["landshold","Hvilket landshold har du set ved VM eller EM?"],["landshold","Nævn et landshold fra international fodbold"],["landshold","Hvilket land kan du nævne fra en stor slutrunde?"]
  ];
  const data = prompts.map(([kategori, tekst], qi) => {
    const entries = pools[kategori].map((navn, i) => {
      const aliaser = [];
      if (navn === "FC København") aliaser.push("FCK","København");
      if (navn === "Barcelona") aliaser.push("Barca","FC Barcelona");
      if (navn === "Bayern München") aliaser.push("Bayern Munich","Bayern");
      if (navn === "Manchester United") aliaser.push("Man United","Man Utd");
      if (navn === "Manchester City") aliaser.push("Man City");
      if (navn === "Paris Saint-Germain") aliaser.push("PSG");
      if (navn === "Lionel Messi") aliaser.push("Messi");
      if (navn === "N’Golo Kanté") aliaser.push("Kante","N Golo Kante");
      if (navn === "Cristiano Ronaldo") aliaser.push("Ronaldo","CR7");
      if (navn === "Robert Lewandowski") aliaser.push("Lewandowski");
      return { navn, aliaser, grad: i < 3 ? 1 : i < 8 ? 2 : i < 15 ? 3 : i < 23 ? 4 : 5 };
    });
    return { id: qi, tekst, answers: entries, trivia: trivia[kategori] };
  });
  window.SPOERGSMAAL = data;
})();
