const postTemplate = [
   {
      "language": "English",
      "languageCode": "en",
      "category": "ATP Tennis Predictions",
      "categoryId": 8996,
      "title": "nameOfEvent Predictions: playerOne vs playerTwo – shortDateOfEvent",
      "contents": function (nameOfEvent,
         leads,
         addressOfEvent,
         playerOne,
         playerTwo,
         shortDateOfEvent,
         eventFullDate,
         roundOfEvent,
         dayOfEvent,
         paraphrasedBlog,
         player1slug,
         player2slug,
         imgWrapper) {
         return `<div style="padding-bottom: 5px;">
         <h2 style="margin-top: unset;">ATP ${nameOfEvent}</h2>
         <p>${eventFullDate}, ${addressOfEvent}.</p>
         </div>
         
         <div style="display: flex; flex-direction: row;">${imgWrapper?.join("")}</div>
         
         <div style="margin: 15px 0">
         <ul>
         <li>The match up: ${playerOne} vs ${playerTwo}</li>
         <li>Event Name: ${nameOfEvent}</li>
         <li>Match Date: ${shortDateOfEvent}</li>
         ${roundOfEvent ? `<li>Match Round: ${roundOfEvent}</li>` : ""}
         <li>Day Of Event: ${dayOfEvent}</li>
         <li>Event Address: ${addressOfEvent}</li>
         </ul>
         </div>
         
         ${`<p>
         The 2024 ${nameOfEvent} continues with plenty of interesting matches on the ${dayOfEvent} schedule. 
         Let's have a look at all the career, performance and head-to-head stats for the match and find out if ${playerOne} or ${playerTwo} is expected to win.
         </p>`.replace(/\n/g, " ")}
         
         <br/> <br/>
         
         <h3>Match Details:</h3>
         <p>${playerOne} vs ${playerTwo}${roundOfEvent ? " - " + roundOfEvent + " - " : " - "}${shortDateOfEvent} - ${nameOfEvent} - ${addressOfEvent}</p>
         
         <br/> <br/>
         
         <h3>${playerOne} vs ${playerTwo} Head-to-Head, Preview, Stats & Pick:</h3>
         <article>
         <h5>Head To Head ${leads}.</h5>
         <br/>
         <p>${paraphrasedBlog && paraphrasedBlog?.replace(/^"|"$/g, '')}</p>
         </article>
         
         <br/> <br/>
         
         <h3>${playerOne} vs ${playerTwo} Prediction:</h3>
         
         <p>
         I believe ${playerOne} will win in straight sets. 
         The Stevegtennis.com prediction algorithm has a much better success rate in picking 
         match winners than me!\n
         So check out who it picks for this match here: <a href="https://www.stevegtennis.com/head-to-head/men/${player1slug}/${player2slug}/" target="_blank">
         Stevegtennis.com ${playerOne} vs ${playerTwo} prediction.
         </a> 
         </p>`
      },
      "tags": "name Predictions",
      "eventName": "ATP"
   },
   {
      "language": "Spanish",
      "languageCode": "es",
      "category": "Pronósticos De Tenis ATP",
      "categoryId": 9262,
      "title": "Pronósticos de nameOfEvent: playerOne vs playerTwo - shortDateOfEvent",
      "contents": function (nameOfEvent,
         leads,
         addressOfEvent,
         playerOne,
         playerTwo,
         shortDateOfEvent,
         eventFullDate,
         roundOfEvent,
         dayOfEvent,
         paraphrasedBlog,
         player1slug,
         player2slug,
         imgWrapper) {

         return `<div style="padding-bottom: 5px;">
            <h2 style="margin-top: unset;">${nameOfEvent}</h2>
            <p>${eventFullDate}, ${addressOfEvent}.</p>
        </div>
        
        <div style="display: flex; flex-direction: row;">
            ${imgWrapper?.join("")}
        </div>
        
        <div style="margin: 15px 0;">
            <ul>
                <li>El enfrentamiento: ${playerOne} contra ${playerTwo}</li>
                <li>Nombre del evento: ${nameOfEvent}</li>
                <li>Fecha del partido: ${shortDateOfEvent}</li>
                ${roundOfEvent ? `<li>Ronda de partido: ${roundOfEvent}</li>` : ""}
                <li>Día del evento: ${dayOfEvent}</li>
                <li>Dirección del evento: ${addressOfEvent}</li>
            </ul>
        </div>
        
        ${`<p>
            El ${nameOfEvent} de 2024 continúa con muchos partidos interesantes en el calendario de ${dayOfEvent}. 
            Echemos un vistazo a todas las estadísticas de carrera, rendimiento y enfrentamientos directos del partido y descubramos si se espera que ${playerOne} o ${playerTwo} ganen.
        </p>`.replace(/\n/g, " ")}
        
        <br/> <br/>
        
        <h3>Detalles del partido:</h3>
        <p>${playerOne} frente a ${playerTwo}${roundOfEvent ? " - " + roundOfEvent + " - " : " - "}${shortDateOfEvent} - ${nameOfEvent} - ${addressOfEvent}</p>
        
        <br/> <br/>
        
        <h3>${playerOne} vs ${playerTwo} cara a cara, vista previa, estadísticas y selección:</h3>
        <article>
            <h5>Enfrentamiento ${leads}.</h5>
            <br/>
            <p>${paraphrasedBlog && paraphrasedBlog?.replace(/^"|"$/g, '')}</p>
        </article>
        
        <br/> <br/>
        
        <h3>Pronóstico ${playerOne} vs ${playerTwo}:</h3>
        
        <p>
            Creo que ${playerOne} ganará en sets corridos. 
            El algoritmo de Pronóstico de Stevegtennis.com tiene una tasa de éxito mucho mayor al elegir 
            Ganadores del partido que yo!\n
            Así que mira a quién elige para este partido aquí: <a href="https://www.stevegtennis.com/head-to-head/men/${player1slug}/${player2slug}/" target="_blank" >
            Stevegtennis.com ${playerOne} vs ${playerTwo} Pronóstico.
            </a> 
        </p>`

      },
      "tags": "Pronósticos de name",
      "eventName": "Pronósticos"
   },
   {
      "language": "Portuguese",
      "languageCode": "pt-BR",
      "category": "Palpites Tênis ATP",
      "categoryId": 9263,
      "title": "Palpites de nameOfEvent: playerOne vs playerTwo - shortDateOfEvent",
      "contents": function (nameOfEvent,
         leads,
         addressOfEvent,
         playerOne,
         playerTwo,
         shortDateOfEvent,
         eventFullDate,
         roundOfEvent,
         dayOfEvent,
         paraphrasedBlog,
         player1slug,
         player2slug,
         imgWrapper) {
         return `<div style="padding-bottom: 5px;">
         <h2 style="margin-top: unset;">${nameOfEvent}</h2>
         <p>${eventFullDate}, ${addressOfEvent}.</p>
     </div>
     
     <div style="display: flex; flex-direction: row;">
         ${imgWrapper?.join("")}
     </div>
     
     <div style="margin: 15px 0;">
         <ul>
             <li>O confronto: ${playerOne} vs ${playerTwo}</li>
             <li>Nome do evento: ${nameOfEvent}</li>
             <li>Data da partida: ${shortDateOfEvent}</li>
             ${roundOfEvent ? `<li>Rodada da partida: ${roundOfEvent}</li>` : ""}
             <li>Dia do evento: ${dayOfEvent}</li>
             <li>Endereço do evento: ${addressOfEvent}</li>
         </ul>
     </div>
     
     ${`<p>
         O ${nameOfEvent} 2024 continua com muitas partidas interessantes na programação do ${dayOfEvent}. 
         Vamos dar uma olhada em todas as estatísticas de carreira, desempenho e confrontos diretos da partida e descobrir se ${playerOne} ou ${playerTwo} devem vencer.
     </p>`.replace(/\n/g, " ")}
     
     <br/> <br/>
     
     <h3>Detalhes da partida:</h3>
     <p>${playerOne} vs ${playerTwo}${roundOfEvent ? " - " + roundOfEvent + " - " : " - "}${shortDateOfEvent} - ${nameOfEvent} - ${addressOfEvent}</p>
     
     <br/> <br/>
     
     <h3>${playerOne} vs ${playerTwo} confronto direto, visualização, estatísticas e escolha:</h3>
     <article>
         <h5>Confronto direto ${leads}.</h5>
         <br/>
         <p>${paraphrasedBlog && paraphrasedBlog?.replace(/^"|"$/g, '')}</p>
     </article>
     
     <br/> <br/>
     
     <h3>${playerOne} vs ${playerTwo} Previsão:</h3>
     
     <p>
         Acredito que ${playerOne} vencerá em dois sets. 
         O algoritmo de previsão Stevegtennis.com tem uma taxa de sucesso muito melhor na escolha 
         vencedores das partidas do que eu!\n
         Então confira quem será escolhido para esta partida aqui: <a href="https://www.stevegtennis.com/head-to-head/men/${player1slug}/${player2slug}/" target="_blank" >
         Stevegtennis.com Previsão de ${playerOne} vs ${playerTwo}.
         </a> 
     </p>`

      },
      "tags": "Palpites de name",
      "eventName": "Palpites"
   },
   {
      "language": "French",
      "languageCode": "fr",
      "category": "Pronostics Tennis ATP",
      "categoryId": 9264,
      "title": "Pronostics nameOfEvent : playerOne contre playerTwo - shortDateOfEvent",
      "contents": function (nameOfEvent,
         leads,
         addressOfEvent,
         playerOne,
         playerTwo,
         shortDateOfEvent,
         eventFullDate,
         roundOfEvent,
         dayOfEvent,
         paraphrasedBlog,
         player1slug,
         player2slug,
         imgWrapper) {
         return `<div style="padding-bottom: 5px;">
         <h2 style="margin-top: unset;">${nameOfEvent}</h2>
         <p>${eventFullDate}, ${addressOfEvent}.</p>
     </div>
     
     <div style="display: flex; flex-direction: row;">
         ${imgWrapper?.join("")}
     </div>
     
     <div style="margin: 15px 0;">
         <ul>
             <li>Le match : ${playerOne} contre ${playerTwo}</li>
             <li>Nom de l'événement : ${nameOfEvent}</li>
             <li>Date du match : ${shortDateOfEvent}</li>
             ${roundOfEvent ? `<li>Tour de match : ${roundOfEvent}</li>` : ""}
             <li>Jour de l'événement : ${dayOfEvent}</li>
             <li>Adresse de l'événement : ${addressOfEvent}</li>
         </ul>
     </div>
     
     ${`<p>
         Le ${nameOfEvent} 2024 se poursuit avec de nombreux matchs intéressants au programme du ${dayOfEvent}. 
         Jetons un coup d'œil à toutes les statistiques de carrière, de performance et d'affrontement du match et découvrons si ${playerOne} ou ${playerTwo} devrait gagner.
     </p>`.replace(/\n/g, " ")}
     
     <br/> <br/>
     
     <h3>Détails du match :</h3>
     <p>${playerOne} contre ${playerTwo}${roundOfEvent ? " - " + roundOfEvent + " - " : " - "}${shortDateOfEvent} - ${nameOfEvent} - ${addressOfEvent}</p>
     
     <br/> <br/>
     
     <h3>${playerOne} contre ${playerTwo} Face-à-face, aperçu, statistiques et choix :</h3>
     <article>
         <h5>Tête à face ${leads}.</h5>
         <br/>
         <p>${paraphrasedBlog && paraphrasedBlog?.replace(/^"|"$/g, '')}</p>
     </article>
     
     <br/> <br/>
     
     <h3>Pronostic ${playerOne} contre ${playerTwo} :</h3>
     
     <p>
         Je pense que ${playerOne} gagnera en deux sets. 
         L'algorithme de Pronostic de Stevegtennis.com a un bien meilleur taux de réussite en matière de sélection 
         des gagnants de match que moi !\n
         Alors découvrez qui il choisit pour ce match ici : <a href="https://www.stevegtennis.com/head-to-head/men/${player1slug}/${player2slug}/" target="_blank" >
         Pronostic Stevegtennis.com ${playerOne} contre ${playerTwo}.
         </a> 
     </p>`

      },
      "tags": "Pronostics name",
      "eventName": "Pronostics"
   },
   {
      "language": "German",
      "languageCode": "de",
      "category": "Doppel Tipps Tennis ATP",
      "categoryId": 9265,
      "title": "nameOfEvent Doppel Tipps: playerOne vs playerTwo - shortDateOfEvent",
      "contents": function (nameOfEvent,
         leads,
         addressOfEvent,
         playerOne,
         playerTwo,
         shortDateOfEvent,
         eventFullDate,
         roundOfEvent,
         dayOfEvent,
         paraphrasedBlog,
         player1slug,
         player2slug,
         imgWrapper) {
         return `<div style="padding-bottom: 5px;">
         <h2 style="margin-top: unset;">${nameOfEvent}</h2>
         <p>${eventFullDate}, ${addressOfEvent}.</p>
     </div>
     
     <div style="display: flex; flex-direction: row;">
         ${imgWrapper?.join("")}
     </div>
     
     <div style="margin: 15px 0;">
         <ul>
             <li>Das Match: ${playerOne} gegen ${playerTwo}</li>
             <li>Ereignisname: ${nameOfEvent}</li>
             <li>Spiel Datum: ${shortDateOfEvent}</li>
             ${roundOfEvent ? `<li>Match Round: ${roundOfEvent}</li>` : ""}
             <li>Tag des Ereignisses: ${dayOfEvent}</li>
             <li>Ereignisadresse: ${addressOfEvent}</li>
         </ul>
     </div>
     
     ${`<p>
         Das ${nameOfEvent} 2024 geht mit vielen interessanten Spielen im ${dayOfEvent}-Zeitplan weiter. 
         Werfen wir einen Blick auf alle Karriere-, Leistungs- und Head-to-Head-Statistiken für das Spiel und finden wir heraus, ob ${playerOne} oder ${playerTwo} voraussichtlich gewinnen wird.
     </p>`.replace(/\n/g, " ")}
     
     <br/> <br/>
     
     <h3>Spieldetails:</h3>
     <p>${playerOne} vs ${playerTwo}${roundOfEvent ? " - " + roundOfEvent + " - " : " - "}${shortDateOfEvent} - ${nameOfEvent} - ${addressOfEvent}</p>
     
     <br/> <br/>
     
     <h3>${playerOne} vs. ${playerTwo} Head-to-Head, Vorschau, Statistiken & Auswahl:</h3>
     <article>
         <h5>Kopf an Kopf ${leads}.</h5>
         <br/>
         <p>${paraphrasedBlog && paraphrasedBlog?.replace(/^"|"$/g, '')}</p>
     </article>
     
     <br/> <br/>
     
     <h3>${playerOne} vs ${playerTwo} Doppel Tipps:</h3>
     
     <p>
         Ich glaube, dass ${playerOne} in geraden Sätzen gewinnen wird. 
         Der Doppel Tippsalgorithmus von Stevegtennis.com hat eine viel bessere Erfolgsquote bei der Auswahl 
         Matchwinner als ich!\n
         Schauen Sie sich also hier an, wer für dieses Spiel ausgewählt wird: <a href="https://www.stevegtennis.com/head-to-head/men/${player1slug}/${player2slug}/" target="_blank" >
         Stevegtennis.com ${playerOne} vs. ${playerTwo} Doppel Tipps.
         </a> 
     </p>`
      },
      "tags": "name Vorhersagen",
      "eventName": "Doppel Tipps"
   },
   {
      "language": "Italian",
      "languageCode": "it",
      "category": "Pronostici Tennis ATP",
      "categoryId": 9266,
      "title": "Pronostici su nameOfEvent: playerOne vs playerTwo - shortDateOfEvent",
      "contents": function (nameOfEvent,
         leads,
         addressOfEvent,
         playerOne,
         playerTwo,
         shortDateOfEvent,
         eventFullDate,
         roundOfEvent,
         dayOfEvent,
         paraphrasedBlog,
         player1slug,
         player2slug,
         imgWrapper) {
         return `
         <div style="padding-bottom: 5px;">
           <h2 style="margin-top: unset;">${nameOfEvent}</h2>
           <p>${eventFullDate}, ${addressOfEvent}.</p>
         </div>
         
         <div style="display: flex; flex-direction: row;">
           ${imgWrapper?.join("")}
         </div>
         
         <div style="margin: 15px 0;">
           <ul>
             <li>La partita è: ${playerOne} contro ${playerTwo}</li>
             <li>Nome evento: ${nameOfEvent}</li>
             <li>Data della partita: ${shortDateOfEvent}</li>
             ${roundOfEvent ? `<li>Turno della partita: ${roundOfEvent}</li>` : ""}
             <li>Giorno dell'evento: ${dayOfEvent}</li>
             <li>Indirizzo dell'evento: ${addressOfEvent}</li>
           </ul>
         </div>
         
         ${`<p>
         Il ${nameOfEvent} 2024 continua con tantissime partite interessanti nel programma di ${dayOfEvent}. 
         Diamo un'occhiata a tutte le statistiche relative a carriera, prestazioni e testa a testa della partita e scopriamo se ci si aspetta che ${playerOne} o ${playerTwo} vincano.
         </p>`.replace(/\n/g, " ")}
         
         <br/><br/>
         
         <h3>Dettagli partita:</h3>
         <p>${playerOne} contro ${playerTwo}${roundOfEvent ? " - " + roundOfEvent + " - " : " - "}${shortDateOfEvent} - ${nameOfEvent} - ${addressOfEvent}</p>
         
         <br/><br/>
         
         <h3>Confronto testa a testa tra ${playerOne} e ${playerTwo}, anteprima, statistiche e scelta:</h3>
         <article>
           <h5>Testa a testa ${leads}.</h5>
           <br/>
           <p>${paraphrasedBlog && paraphrasedBlog?.replace(/^"|"$/g, '')}</p>
         </article>
         
         <br/><br/>
         
         <h3>Pronostico ${playerOne} vs ${playerTwo}:</h3>
         
         <p>
         Credo che ${playerOne} vincerà in due set. 
         L'algoritmo di previsione di Stevegtennis.com ha un tasso di successo molto migliore nel prelievo 
         vincitori della partita rispetto a me!\n
         Quindi controlla chi sceglie per questa partita qui: <a href="https://www.stevegtennis.com/head-to-head/men/${player1slug}/${player2slug}/" target="_blank">
         Pronostico di Stevegtennis.com ${playerOne} vs ${playerTwo}.
         </a> 
         </p>`
      },
      "tags": "name Pronostici",
      "eventName": "Pronostici"
   },
   {
      "language": "Polish",
      "languageCode": "pl",
      "category": "Prognozy Tenis ATP",
      "categoryId": 9267,
      "title": "Prognozy nameOfEvent: playerOne vs playerTwo – shortDateOfEvent",
      "contents": function (nameOfEvent,
         leads,
         addressOfEvent,
         playerOne,
         playerTwo,
         shortDateOfEvent,
         eventFullDate,
         roundOfEvent,
         dayOfEvent,
         paraphrasedBlog,
         player1slug,
         player2slug,
         imgWrapper) {
         return `<div style="padding-bottom: 5px;">
         <h2 style="margin-top: unset;">${nameOfEvent}</h2>
         <p>${eventFullDate}, ${addressOfEvent}.</p>
      </div>
      
      <div style="display: flex; flex-direction: row;">
         ${imgWrapper?.join("")}
      </div>
      
      <div style="margin: 15px 0;">
         <ul>
            <li>Pojedynek: ${playerOne} kontra ${playerTwo}</li>
            <li>Nazwa wydarzenia: ${nameOfEvent}</li>
            <li>Data meczu: ${shortDateOfEvent}</li>
            ${roundOfEvent ? `<li>Runda meczowa: ${roundOfEvent}</li>` : ""}
            <li>Dzień wydarzenia: ${dayOfEvent}</li>
            <li>Adres wydarzenia: ${addressOfEvent}</li>
         </ul>
      </div>
      
      ${`<p>
      ${nameOfEvent} 2024 będzie kontynuowane z mnóstwem interesujących meczów w harmonogramie ${dayOfEvent}. 
      Rzućmy okiem na wszystkie statystyki dotyczące kariery, występów i bezpośrednich pojedynków w tym meczu i dowiedzmy się, czy wygra ${playerOne} czy ${playerTwo}.
      </p>`.replace(/\n/g, " ")}
      
      <br/> <br/>
      
      <h3>Szczegóły meczu:</h3>
      <p>${playerOne} kontra ${playerTwo}${roundOfEvent ? " - " + roundOfEvent + " - " : " - "}${shortDateOfEvent} - ${nameOfEvent} - ${addressOfEvent}</p>
      
      <br/> <br/>
      
      <h3>${playerOne} kontra ${playerTwo} bezpośrednie starcie, podgląd, statystyki i wybór:</h3>
      <article>
         <h5>Bezpośrednie ${leads}.</h5>
         <br/>
         <p>${paraphrasedBlog && paraphrasedBlog?.replace(/^"|"$/g, '')}</p>
      </article>
      
      <br/> <br/>
      
      <h3>${playerOne} vs ${playerTwo} Prognoza:</h3>
      
      <p>
      Wierzę, że ${playerOne} wygra w prostych setach. 
      Algorytm przewidywania Stevegtennis.com ma znacznie lepszy wskaźnik skuteczności kompletacji 
      zwycięzcy meczu ode mnie!\n
      Sprawdź więc, kogo wybiera na ten mecz tutaj: <a href="https://www.stevegtennis.com/head-to-head/men/${player1slug}/${player2slug}/" target="_blank">
      Prognoza Stevegtennis.com ${playerOne} vs ${playerTwo}.
      </a> 
      </p>
      `
      },
      "tags": "Prognozy name",
      "eventName": "Prognozy"
   },
   {
      "language": "Dutch",
      "languageCode": "nl",
      "category": "Tennis Wedtips En Voorspellingen ATP",
      "categoryId": 9268,
      "title": "nameOfEvent Voorspellingen Wedtips: playerOne versus playerTwo - shortDateOfEvent",
      "contents": function (nameOfEvent,
         leads,
         addressOfEvent,
         playerOne,
         playerTwo,
         shortDateOfEvent,
         eventFullDate,
         roundOfEvent,
         dayOfEvent,
         paraphrasedBlog,
         player1slug,
         player2slug,
         imgWrapper) {
         return `
         <div style="padding-bottom: 5px;">
            <h2 style="margin-top: unset;">${nameOfEvent}</h2>
            <p>${eventFullDate}, ${addressOfEvent}.</p>
         </div>
         
         <div style="display: flex; flex-direction: row;">
            ${imgWrapper?.join("")}
         </div>
         
         <div style="margin: 15px 0;">
            <ul>
               <li>De wedstrijd: ${playerOne} versus ${playerTwo}</li>
               <li>Gebeurtenisnaam: ${nameOfEvent}</li>
               <li>Wedstrijddatum: ${shortDateOfEvent}</li>
               ${roundOfEvent ? `<li>Wedstrijdronde: ${roundOfEvent}</li>` : ""}
               <li>Dag van het evenement: ${dayOfEvent}</li>
               <li>Evenementadres: ${addressOfEvent}</li>
            </ul>
         </div>
         
         ${`<p>
         De ${nameOfEvent} 2024 gaat verder met veel interessante wedstrijden op het ${dayOfEvent} schema. 
         Laten we eens kijken naar alle carrière-, prestatie- en onderlinge statistieken voor de wedstrijd en kijken of ${playerOne} of ${playerTwo} naar verwachting zal winnen.
         </p>`.replace(/\n/g, " ")}
         
         <br/> <br/>
         
         <h3>Wedstrijddetails:</h3>
         <p>${playerOne} versus ${playerTwo}${roundOfEvent ? " - " + roundOfEvent + " - " : " - "}${shortDateOfEvent} - ${nameOfEvent} - ${addressOfEvent}</p>
         
         <br/> <br/>
         
         <h3>${playerOne} versus ${playerTwo} Head-to-Head, preview, statistieken en keuze:</h3>
         <article>
            <h5>Head to Head ${leads}.</h5>
            <br/>
            <p>${paraphrasedBlog && paraphrasedBlog?.replace(/^"|"$/g, '')}</p>
         </article>
         
         <br/> <br/>
         
         <h3>${playerOne} versus ${playerTwo} Voorspelling:</h3>
         
         <p>
         Ik geloof dat ${playerOne} in twee sets zal winnen. 
         Het voorspellingsalgoritme van Stevegtennis.com heeft een veel beter succespercentage bij het kiezen 
         wedstrijdwinnaars dan ik!\n
         Bekijk hier dus wie er voor deze wedstrijd wordt uitgekozen: <a href="https://www.stevegtennis.com/head-to-head/men/${player1slug}/${player2slug}/" target="_blank">
         Stevegtennis.com ${playerOne} versus ${playerTwo} voorspelling Wedtips.
         </a> 
         </p>
         `
      },
      "tags": "name Voorspellingen Wedtips",
      "eventName": "Wedtips"
   },
   {
      "language": "Turkish",
      "languageCode": "tr",
      "category": "Tenis Tahminleri ATP",
      "categoryId": 9269,
      "title": "nameOfEvent Tahminler: playerOne vs playerTwo – shortDateOfEvent",
      "contents": function (nameOfEvent,
         leads,
         addressOfEvent,
         playerOne,
         playerTwo,
         shortDateOfEvent,
         eventFullDate,
         roundOfEvent,
         dayOfEvent,
         paraphrasedBlog,
         player1slug,
         player2slug,
         imgWrapper) {
         return `
         <div style="padding-bottom: 5px;">
            <h2 style="margin-top: unset;">${nameOfEvent}</h2>
            <p>${eventFullDate}, ${addressOfEvent}.</p>
         </div>
         
         <div style="display: flex; flex-direction: row;">
            ${imgWrapper?.join("")}
         </div>
         
         <div style="margin: 15px 0;">
            <ul>
               <li>Eşleşme: ${playerOne} ile ${playerTwo}</li>
               <li>Etkinlik Adı: ${nameOfEvent}</li>
               <li>Maç Tarihi: ${shortDateOfEvent}</li>
               ${roundOfEvent ? `<li>Maç Turu: ${roundOfEvent}</li>` : ""}
               <li>Etkinlik Günü: ${dayOfEvent}</li>
               <li>Etkinlik Adresi: ${addressOfEvent}</li>
            </ul>
         </div>
         
         ${`<p>
         2024 ${nameOfEvent}, ${dayOfEvent} programında birçok ilginç maçla devam ediyor. 
         Maçın tüm kariyer, performans ve kafa kafaya istatistiklerine bir göz atalım ve ${playerOne}'ın mı yoksa ${playerTwo}'un mu kazanmasının beklendiğini öğrenelim.
         </p>`.replace(/\n/g, " ")}
         
         <br/><br/>
         
         <h3>Eşleşme Ayrıntıları:</h3>
         <p>${playerOne} vs ${playerTwo}${roundOfEvent ? " - " + roundOfEvent + " - " : " - "}${shortDateOfEvent} - ${nameOfEvent} - ${addressOfEvent}</p>
         
         <br/><br/>
         
         <h3>${playerOne} ile ${playerTwo} Karşı karşıya, Önizleme, İstatistikler ve Seçim:</h3>
         <article>
            <h5>Birebir ${leads}.</h5>
            <br/>
            <p>${paraphrasedBlog?.replace(/^"|"$/g, '')}</p>
         </article>
         
         <br/><br/>
         
         <h3>${playerOne} vs ${playerTwo} Tahmini:</h3>
         
         <p>
         ${playerOne}'ın düz setlerde kazanacağına inanıyorum. 
         Stevegtennis.com tahmin algoritması toplamada çok daha iyi bir başarı oranına sahip 
         maçı benden kazananlar!\n
         Bu maç için kimi seçtiğine buradan göz atabilirsiniz: <a href="https://www.stevegtennis.com/head-to-head/men/${player1slug}/${player2slug}/" target="_blank">
         Stevegtennis.com ${playerOne} vs ${playerTwo} tahmini.
         </a> 
         </p>
         `
      },
      "tags": "name Tahminleri",
      "eventName": "Tahminleri"
   },
   {
      "language": "Chinese Mandarin",
      "languageCode": "zh-CN",
      "category": "ATP 网球预测",
      "categoryId": 9270,
      "title": "nameOfEvent 预测：playerOne vs playerTwo - shortDateOfEvent",
      "contents": function (nameOfEvent,
         leads,
         addressOfEvent,
         playerOne,
         playerTwo,
         shortDateOfEvent,
         eventFullDate,
         roundOfEvent,
         dayOfEvent,
         paraphrasedBlog,
         player1slug,
         player2slug,
         imgWrapper) {
         return `
         <div style="padding-bottom: 5px;">
            <h2 style="margin-top: unset;">${nameOfEvent}</h2>
            <p>${eventFullDate}，${addressOfEvent}。</p>
         </div>
         
         <div style="display: flex; flex-direction: row;">
            ${imgWrapper?.join("")}
         </div>
         
         <div style="margin: 15px 0">
            <ul>
               <li>比赛：${playerOne} vs ${playerTwo}</li>
               <li>活动名称：${nameOfEvent}</li>
               <li>比赛日期：${shortDateOfEvent}</li>
               ${roundOfEvent ? `<li>匹配回合：${roundOfEvent}</li>` : ""}
               <li>活动日期：${dayOfEvent}</li>
               <li>活动地址：${addressOfEvent}</li>
            </ul>
         </div>
         
         ${`<p>
         2024 年 ${nameOfEvent} 的 ${dayOfEvent} 日程安排中将继续举办大量有趣的比赛。 
         让我们看一下比赛的所有职业生涯、表现和交锋统计数据，看看 ${playerOne} 或 ${playerTwo} 是否有望获胜。
         </p>`.replace(/\n/g, " ")}
         
         <br/><br/>
         
         <h3>比赛详情：</h3>
         <p>${playerOne} 对阵 ${playerTwo}${roundOfEvent ? " - " + roundOfEvent + " - " : " - "}${shortDateOfEvent} - ${nameOfEvent} - ${addressOfEvent}</p>
         
         <br/><br/>
         
         <h3>${playerOne} 与 ${playerTwo} 的对决、预览、统计数据和选择：</h3>
         <article>
            <h5>头对头${leads}。</h5>
            <br/>
            <p>${paraphrasedBlog?.replace(/^"|"$/g, '')}</p>
         </article>
         
         <br/><br/>
         
         <h3>${playerOne} vs ${playerTwo} 预测：</h3>
         
         <p>
         我相信${playerOne}会直落两盘获胜。 
         Stevegtennis.com 的预测算法在挑选方面有更好的成功率 
         比我还赢的比赛！
         因此，请在此处查看本场比赛的选择：<a href="https://www.stevegtennis.com/head-to-head/men/${player1slug}/${player2slug}/" target="_blank">
         Stevegtennis.com ${playerOne} vs ${playerTwo} 预测。
         </a> 
         </p>
         `
      },
      "tags": "name 预测",
      "eventName": null
   },
   {
      "language": "Arabic",
      "languageCode": "ar",
      "category": "توقعات اتحاد لاعبي التنس المحترفين للتنس",
      "categoryId": 9271,
      "title": "`توقعات nameOfEvent: playerOne vs playerTwo - shortDateOfEvent",
      "contents": function (nameOfEvent,
         leads,
         addressOfEvent,
         playerOne,
         playerTwo,
         shortDateOfEvent,
         eventFullDate,
         roundOfEvent,
         dayOfEvent,
         paraphrasedBlog,
         player1slug,
         player2slug,
         imgWrapper) {
         return `
         <div style="padding-bottom: 5px;">
            <h2 style="margin-top: unset;">${nameOfEvent}</h2>
            <p>${eventFullDate}, ${addressOfEvent}.</p>
         </div>
         
         <div style="display: flex; flex-direction: row;">
            ${imgWrapper?.join("")}
         </div>
         
         <div style="margin: 15px 0">
            <ul>
               <li>المباراة: ${playerOne} ضد ${playerTwo}</li>
               <li>اسم الحدث: ${nameOfEvent}</li>
               <li>تاريخ المباراة: ${shortDateOfEvent}</li>
               ${roundOfEvent ? `<li>جولة المباراة: ${roundOfEvent}</li>` : ""}
               <li>يوم الحدث: ${dayOfEvent}</li>
               <li>عنوان الحدث: ${addressOfEvent}</li>
            </ul>
         </div>
         
         ${`<p>
         يستمر حدث ${nameOfEvent} لعام 2024 مع الكثير من المباريات المثيرة للاهتمام وفقًا لجدول ${dayOfEvent}. 
         دعونا نلقي نظرة على جميع الإحصائيات المهنية والأداء والمواجهات المباشرة للمباراة ونكتشف ما إذا كان ${playerOne} أو ${playerTwo} من المتوقع أن يفوز.
         </p>`.replace(/\n/g, " ")}
         
         <br/><br/>
         
         <h3>تفاصيل المباراة:</h3>
         <p>${playerOne} ضد ${playerTwo}${roundOfEvent ? " - " + roundOfEvent + " - " : " - "}${shortDateOfEvent} - ${nameOfEvent} - ${addressOfEvent}</p>
         
         <br/><br/>
         
         <h3>${playerOne} vs ${playerTwo} المواجهات المباشرة والمعاينة والإحصائيات والاختيار:</h3>
         <article>
            <h5>وجها لوجه ${leads}.</h5>
            <br/>
            <p>${paraphrasedBlog?.replace(/^"|"$/g, '')}</p>
         </article>
         
         <br/><br/>
         
         <h3>توقع ${playerOne} مقابل ${playerTwo}:</h3>
         
         <p>
         أعتقد أن ${playerOne} سيفوز بمجموعتين متتاليتين. 
         تتمتع خوارزمية التنبؤ Stevegtennis.com بمعدل نجاح أفضل بكثير في اختيار 
         الفائزين بالمباراة أكثر مني!
         لذا تحقق من من يختاره لهذه المباراة هنا: 
         <a href="https://www.stevegtennis.com/head-to-head/men/${player1slug}/${player2slug}/" target="_blank">
         توقع موقع Stevegtennis.com ${playerOne} مقابل ${playerTwo}.
         </a> 
         </p>
         `
      }, "tags": "توقعات  name",
      "eventName": null
   },
   {
      "language": "Japanese",
      "languageCode": "ja",
      "category": "ATPテニスの予想",
      "categoryId": 9272,
      "title": "nameOfEvent の予測: playerOne 対 playerTwo – shortDateOfEvent",
      "contents": function (nameOfEvent,
         leads,
         addressOfEvent,
         playerOne,
         playerTwo,
         shortDateOfEvent,
         eventFullDate,
         roundOfEvent,
         dayOfEvent,
         paraphrasedBlog,
         player1slug,
         player2slug,
         imgWrapper) {
         return `
         <div style="padding-bottom: 5px;">
            <h2 style="margin-top: unset;">${nameOfEvent}</h2>
            <p>${eventFullDate}、${addressOfEvent}。</p>
         </div>
         
         <div style="display: flex; flex-direction: row;">
            ${imgWrapper?.join("")}
         </div>
         
         <div style="margin: 15px 0">
            <ul>
               <li>対戦: ${playerOne} 対 ${playerTwo}</li>
               <li>イベント名: ${nameOfEvent}</li>
               <li>試合日: ${shortDateOfEvent}</li>
               ${roundOfEvent ? `<li>マッチラウンド: ${roundOfEvent}</li>` : ""}
               <li>イベントの日: ${dayOfEvent}</li>
               <li>イベントアドレス: ${addressOfEvent}</li>
            </ul>
         </div>
         
         ${`<p>
         2024 年の ${nameOfEvent} では、${dayOfEvent} のスケジュールで興味深い試合が数多く行われます。 
         試合のすべてのキャリア、パフォーマンス、対戦成績を見て、${playerOne} と ${playerTwo} のどちらが勝つと予想されるかを調べてみましょう。
         </p>`.replace(/\n/g, " ")}
         
         <br /><br />
         
         <h3>試合の詳細:</h3>
         <p>${playerOne} 対 ${playerTwo}${roundOfEvent ? " - " + roundOfEvent + " - " : " - "}${shortDateOfEvent} - ${nameOfEvent} - ${addressOfEvent}</p>
         
         <br /><br />
         
         <h3>${playerOne} 対 ${playerTwo} の直接対決、プレビュー、統計、選択:</h3>
         <article>
            <h5>直接対決 ${leads}。</h5>
            <br />
            <p>${paraphrasedBlog?.replace(/^"|"$/g, '')}</p>
         </article>
         
         <br /><br />
         
         <h3>${playerOne} 対 ${playerTwo} 予測:</h3>
         
         <p>
            私は ${playerOne} がストレート セットで勝つと信じています。 
            Stevegtennis.com の予測アルゴリズムは、ピッキングの成功率がはるかに優れています。 
            私より勝者と対戦してください!
            この試合に誰が選ばれるかをここでチェックしてください: 
            <a href="https://www.stevegtennis.com/head-to-head/men/${player1slug}/${player2slug}/" target="_blank">
               Stevegtennis.com の ${playerOne} 対 ${playerTwo} の予測。
            </a> 
         </p>
         `
      }, "tags": "name の予測",
      "eventName": null
   },
   {
      "language": "Russian",
      "languageCode": "ru",
      "category": "Прогнозы ATP на теннис",
      "categoryId": 9273,
      "title": "Прогнозы на nameOfEvent: playerOne против playerTwo - shortDateOfEvent",
      "contents": function (nameOfEvent,
         leads,
         addressOfEvent,
         playerOne,
         playerTwo,
         shortDateOfEvent,
         eventFullDate,
         roundOfEvent,
         dayOfEvent,
         paraphrasedBlog,
         player1slug,
         player2slug,
         imgWrapper) {
         return `
         <div style="padding-bottom: 5px;">
            <h2 style="margin-top: unset;">${nameOfEvent}</h2>
            <p>${eventFullDate}, ${addressOfEvent}.</p>
         </div>
         
         <div style="display: flex; flex-direction: row;">
            ${imgWrapper?.join("")}
         </div>
         
         <div style="margin: 15px 0">
            <ul>
               <li>Матч: ${playerOne} против ${playerTwo}</li>
               <li>Название события: ${nameOfEvent}</li>
               <li>Дата матча: ${shortDateOfEvent}</li>
               ${roundOfEvent ? `<li>Раунд матча: ${roundOfEvent}</li>` : ""}
               <li>День мероприятия: ${dayOfEvent}</li>
               <li>Адрес мероприятия: ${addressOfEvent}</li>
            </ul>
         </div>
         
         ${`<p>
         ${nameOfEvent} 2024 года продолжается множеством интересных матчей в расписании ${dayOfEvent}. 
         Давайте посмотрим на всю статистику карьеры, выступлений и личных встреч в матче и выясним, кто, как ожидается, выиграет: ${playerOne} или ${playerTwo}.
         </p>`.replace(/\n/g, " ")}
         
         <br/><br/>
         
         <h3>Подробности матча:</h3>
         <p>${playerOne} против ${playerTwo}${roundOfEvent ? " - " + roundOfEvent + " - " : " - "}${shortDateOfEvent} - ${nameOfEvent} - ${addressOfEvent}</p>
         
         <br/><br/>
         
         <h3>Личный бой ${playerOne} против ${playerTwo}, обзор, статистика и выбор:</h3>
         <article>
            <h5>Сопоставление ${leads}.</h5>
            <br/>
            <p>${paraphrasedBlog?.replace(/^"|"$/g, '')}</p>
         </article>
         
         <br/><br/>
         
         <h3>Прогноз ${playerOne} против ${playerTwo}:</h3>
         
         <p>
            Я считаю, что ${playerOne} выиграет в двух сетах. 
            Алгоритм прогнозирования Stevegtennis.com имеет гораздо лучший показатель успеха при выборе 
            победителей матча, чем я!
            Так что проверьте, кого он выберет для этого матча здесь: 
            <a href="https://www.stevegtennis.com/head-to-head/men/${player1slug}/${player2slug}/" target="_blank">
            Прогноз Stevegtennis.com: ${playerOne} против ${playerTwo}.
            </a> 
         </p>
         `
      }, "tags": "Прогнозы name",
      "eventName": null
   },
   {
      "language": "Hindi",
      "languageCode": "hi",
      "category": "एटीपी टेनिस भविष्यवाणियाँ",
      "categoryId": 9274,
      "title": "nameOfEvent पूर्वानुमान: playerOne बनाम playerTwo - shortDateOfEvent",
      "contents": function (nameOfEvent,
         leads,
         addressOfEvent,
         playerOne,
         playerTwo,
         shortDateOfEvent,
         eventFullDate,
         roundOfEvent,
         dayOfEvent,
         paraphrasedBlog,
         player1slug,
         player2slug,
         imgWrapper) {
         return `<div style='padding-bottom: 5px;'>
         <h2 style='margin-top: unset;'>${nameOfEvent}</h2>
         <p>${eventFullDate}, ${addressOfEvent}.</p>
      </div>
      
      <div style="display: flex; flex-direction: row;">${imgWrapper?.join("")}</div>
      
      <div style="margin: 15px 0">
         <ul>
            <li>मैच जारी: ${playerOne} बनाम ${playerTwo}</li>
            <li>इवेंट का नाम: ${nameOfEvent}</li>
            <li>मैच तिथि: ${shortDateOfEvent}</li>
            ${roundOfEvent ? `<li>मैच राउंड: ${roundOfEvent}</li>` : ""}
            <li>घटना का दिन: ${dayOfEvent}</li>
            <li>इवेंट का पता: ${addressOfEvent}</li>
         </ul>
      </div>
      
      ${`<p>
         2024 ${nameOfEvent} ${dayOfEvent} शेड्यूल पर बहुत सारे दिलचस्प मैचों के साथ जारी है। 
         आइए मैच के सभी करियर, प्रदर्शन और आमने-सामने के आँकड़ों पर एक नज़र डालें और पता करें कि क्या ${playerOne} या ${playerTwo} के जीतने की उम्मीद है।
      </p>`.replace(/\n/g, " ")}
      
      <br/> <br/>
      
      <h3>मैच विवरण:</h3>
      <p>${playerOne} बनाम ${playerTwo}${roundOfEvent ? " - " + roundOfEvent + " - " : " - "}${shortDateOfEvent} - ${nameOfEvent} - ${addressOfEvent}</p>
      
      <br/> <br/>
      
      <h3>${playerOne} बनाम ${playerTwo} आमने-सामने, पूर्वावलोकन, आँकड़े और चयन:</h3>
      <article>
         <h5>हेड टू हेड ${leads}.</h5>
         <br/>
         <p>${paraphrasedBlog && paraphrasedBlog?.replace(/^"|"$/g, '')}</p>
      </article>
      
      <br/> <br/>
      
      <h3>${playerOne} बनाम ${playerTwo} भविष्यवाणी:</h3>
      
      <p>
         मेरा मानना ​​है कि ${playerOne} सीधे सेटों में जीतेगा। 
         स्टीवगटेनिस.कॉम भविष्यवाणी एल्गोरिदम की चयन में सफलता दर काफी बेहतर है 
         मुझसे ज़्यादा मैच विजेता!\n
         तो यहां देखें कि वह इस मैच के लिए किसे चुनता है: <a href='https://www.stevegtennis.com/head-to-head/men/${player1slug}/${player2slug}/' target='_blank' >
         स्टीवगटेनिस.कॉम ${playerOne} बनाम ${playerOne} भविष्यवाणी।
         </a> 
      </p>`
      },
      "tags": "name भविष्यवाणियाँ`",
      "eventName": null
   }
]


module.exports = postTemplate;