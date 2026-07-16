import { siteLocale, type SiteLocale } from "@/lib/site-locale";

type AccountFlowCopy = {
  dateLocale: string;
  common: {
    defaultProfessional: string;
    designer: string;
    studio: string;
    notProvided: string;
    noTags: string;
    projectBrief: string;
  };
  brief: {
    errors: {
      designerRole: string;
      selectBrief: string;
      selectRecipient: string;
      invalidRecipient: string;
      ownProfile: string;
      briefMissing: string;
      studioMissing: string;
      designerMissing: string;
      duplicate: string;
      alreadySentCannotDelete: string;
    };
    studioProfession: string;
    subject: (name: string) => string;
    workspaceLabel: (isClient: boolean) => string;
    back: string;
    eyebrow: string;
    title: (isClient: boolean) => string;
    intro: (isClient: boolean) => string;
    countLabel: (isClient: boolean) => string;
    create: string;
    analyse: string;
    designerModeTitle: string;
    designerModeBody: string;
    sentTitle: string;
    sentBody: string;
    deletedTitle: string;
    deletedBody: string;
    actionError: string;
    emptyTitle: string;
    emptyBody: string;
    created: (value: string) => string;
    selected: string;
    photoCount: (count: number) => string;
    fields: {
      goal: string;
      style: string;
      scope: string;
      budget: string;
      timeline: string;
      area: string;
      roomCount: string;
      rooms: string;
      propertyStatus: string;
      visualization: string;
      supervision: string;
      location: string;
      visualCues: string;
    };
    referencePhotos: string;
    sendPanelTitle: (isClient: boolean) => string;
    sendPanelBody: (isClient: boolean) => string;
    recipient: string;
    recipientPlaceholder: string;
    independentDesigners: string;
    studios: string;
    message: string;
    messagePlaceholder: string;
    send: string;
    designerCannotSend: string;
    noRecipients: string;
    alreadySent: string;
    matchingDesigners: string;
    createAnother: string;
    deleteSummary: string;
    deleteBody: string;
    delete: string;
  };
  inquiries: {
    statuses: Record<string, string>;
    errors: { missing: string; invalidStatus: string; receiverOnly: string; senderOnly: string };
    sentTo: string;
    inquiryFrom: string;
    sentOn: (value: string) => string;
    fields: {
      project: string;
      styles: string;
      scope: string;
      budget: string;
      timeline: string;
      area: string;
      rooms: string;
      property: string;
      visualisation: string;
      supervision: string;
      location: string;
      goal: string;
    };
    referencePhotos: string;
    openConversation: string;
    openDesignerProfile: string;
    replyByEmail: string;
    statusLabel: string;
    updateStatus: string;
    cancelSummary: string;
    cancelBody: string;
    cancel: string;
    back: string;
    eyebrow: string;
    title: string;
    intro: (isDesigner: boolean) => string;
    countLabel: (isDesigner: boolean) => string;
    sendSavedBrief: string;
    statusGuide: string;
    statusGuideBody: Record<string, string>;
    updatedTitle: string;
    updatedBody: string;
    cancelledTitle: string;
    cancelledBody: string;
    actionError: string;
    sentTitle: string;
    incomingTitle: string;
    sentEmptyTitle: string;
    sentEmptyBody: string;
    incomingEmptyTitle: string;
    incomingEmptyBody: string;
    viewPublicProfile: string;
    editProfile: string;
  };
  conversation: {
    errors: { messageOrFile: string; messageTooLong: string };
    attachmentsShared: string;
    client: string;
    designerFallback: string;
    you: string;
    back: string;
    with: (name: string) => string;
    openStudio: string;
    openDesigner: string;
    sent: string;
    messages: string;
    refresh: string;
    firstMessage: string;
    read: string;
    reply: string;
    replyPlaceholder: string;
    attachments: string;
    attachmentLimit: string;
    sendMessage: string;
    sending: string;
    referencePhotos: string;
    openFullBrief: string;
  };
};

const accountFlowCopy: Record<SiteLocale, AccountFlowCopy> = {
  pl: {
    dateLocale: "pl-PL",
    common: {
      defaultProfessional: "Specjalista ArchiCompass",
      designer: "Projektant",
      studio: "Pracownia projektowa",
      notProvided: "Nie podano",
      noTags: "Brak tagów",
      projectBrief: "Brief projektowy",
    },
    brief: {
      errors: {
        designerRole: "Konto projektanta może otrzymywać briefy, ale nie może wysyłać zapytań jako klient.",
        selectBrief: "Najpierw wybierz zapisany brief.",
        selectRecipient: "Przed wysłaniem briefu wybierz projektanta lub pracownię.",
        invalidRecipient: "Wybierz prawidłowy profil projektanta lub pracowni.",
        ownProfile: "Wybierz innego projektanta, a nie własny profil.",
        briefMissing: "Nie znaleziono wybranego zapisanego briefu.",
        studioMissing: "Nie znaleziono profilu tej pracowni.",
        designerMissing: "Nie znaleziono profilu tego projektanta.",
        duplicate: "Ten brief został już wysłany do wybranego specjalisty.",
        alreadySentCannotDelete: "Ten brief został już wysłany. Anuluj zapytanie przed usunięciem briefu.",
      },
      studioProfession: "Pracownia projektowa",
      subject: (name) => `Zapytanie projektowe: ${name}`,
      workspaceLabel: (isClient) => isClient ? "Zobacz wysłane zapytania" : "Otwórz Studio projektanta",
      back: "Wróć do konta",
      eyebrow: "AI Project Compass",
      title: (isClient) => isClient ? "Zapisane briefy" : "Historia analiz",
      intro: (isClient) => isClient
        ? "Przejrzyj briefy utworzone w AI Project Compass i wyślij jeden do projektanta lub pracowni jako czytelne pierwsze zapytanie."
        : "Wróć do wcześniejszych analiz inspiracji. Projektanci korzystają z AI Project Compass, ale nie wysyłają briefów jako klienci.",
      countLabel: (isClient) => isClient ? "Zapisane briefy" : "Analizy w historii",
      create: "Utwórz nowy brief",
      analyse: "Analizuj inspiracje",
      designerModeTitle: "Tryb konta projektanta",
      designerModeBody: "To konto otrzymuje zapytania projektowe w Studio. Możesz analizować inspiracje w AI Project Compass, ale wysyłanie briefów jest zarezerwowane dla kont klientów.",
      sentTitle: "Brief wysłany",
      sentBody: "Zapytanie zostało zapisane w ArchiCompass. Możesz je sprawdzić w zakładce zapytań.",
      deletedTitle: "Brief usunięty",
      deletedBody: "Zapisany brief i prywatne zdjęcia referencyjne zostały usunięte.",
      actionError: "Nie udało się wykonać działania na briefie",
      emptyTitle: "Nie masz jeszcze zapisanych briefów",
      emptyBody: "Utwórz brief AI Project Compass z kierunkiem stylistycznym, wskazówkami wizualnymi i zdjęciami referencyjnymi, a następnie zapisz go tutaj.",
      created: (value) => `Zapisano ${value}`,
      selected: "Wybrany brief",
      photoCount: (count) => `${count} ${count === 1 ? "zdjęcie" : count < 5 ? "zdjęcia" : "zdjęć"}`,
      fields: {
        goal: "Cel", style: "Style", scope: "Zakres", budget: "Budżet", timeline: "Termin", area: "Powierzchnia", roomCount: "Liczba pomieszczeń", rooms: "Pomieszczenia", propertyStatus: "Status nieruchomości", visualization: "Wizualizacja 3D", supervision: "Nadzór", location: "Lokalizacja", visualCues: "Wskazówki wizualne",
      },
      referencePhotos: "Zdjęcia referencyjne briefu",
      sendPanelTitle: (isClient) => isClient ? "Wyślij ten brief" : "Brief do analizy",
      sendPanelBody: (isClient) => isClient
        ? "Wybierz projektanta lub pracownię i dodaj krótką wiadomość. Pełny brief zostanie zapisany razem z zapytaniem."
        : "Ten zapis pozostaje prywatną historią analizy. Zapytania od klientów znajdziesz w Studio projektanta.",
      recipient: "Odbiorca",
      recipientPlaceholder: "Wybierz projektanta lub pracownię",
      independentDesigners: "Niezależni projektanci",
      studios: "Pracownie projektowe",
      message: "Wiadomość",
      messagePlaceholder: "Dzień dobry, przygotowałem brief AI Project Compass i chciałbym sprawdzić, czy ten projekt pasuje do Państwa zakresu pracy.",
      send: "Wyślij brief",
      designerCannotSend: "Konta projektantów nie mogą wysyłać briefów jako klienci.",
      noRecipients: "Nie ma jeszcze dostępnych profili projektantów ani pracowni.",
      alreadySent: "Już wysłano",
      matchingDesigners: "Znajdź dopasowanych projektantów",
      createAnother: "Utwórz kolejny brief",
      deleteSummary: "Usuń zapisany brief",
      deleteBody: "To usunie zapisany brief i prywatne zdjęcia referencyjne. Briefy wysłane już do projektantów trzeba najpierw anulować.",
      delete: "Usuń ten brief",
    },
    inquiries: {
      statuses: { accepted: "Zaakceptowane", declined: "Odrzucone", reviewing: "W analizie", sent: "Wysłane" },
      errors: { missing: "Nie znaleziono zapytania.", invalidStatus: "Wybierz poprawny status zapytania.", receiverOnly: "Tylko odbiorca zapytania może zmienić jego status.", senderOnly: "Tylko nadawca może anulować to zapytanie." },
      sentTo: "Wysłano do",
      inquiryFrom: "Zapytanie od",
      sentOn: (value) => `Wysłano ${value}`,
      fields: { project: "Projekt", styles: "Style", scope: "Zakres", budget: "Budżet", timeline: "Termin", area: "Powierzchnia", rooms: "Pomieszczenia", property: "Nieruchomość", visualisation: "3D", supervision: "Nadzór", location: "Lokalizacja", goal: "Cel" },
      referencePhotos: "Zdjęcia referencyjne z zapytania",
      openConversation: "Otwórz rozmowę",
      openDesignerProfile: "Otwórz profil projektanta",
      replyByEmail: "Odpowiedz e-mailem",
      statusLabel: "Status zapytania",
      updateStatus: "Zaktualizuj status",
      cancelSummary: "Anuluj zapytanie",
      cancelBody: "To usunie zapytanie z ArchiCompass. Zapisany brief pozostanie dostępny w AI Project Compass.",
      cancel: "Anuluj to zapytanie",
      back: "Wróć do konta",
      eyebrow: "Zapytania projektowe",
      title: "Zapytania z briefów",
      intro: (isDesigner) => isDesigner ? "Przeglądaj briefy i wiadomości wysłane do Twojego profilu specjalisty." : "Śledź briefy projektowe i rozmowy rozpoczęte z projektantami.",
      countLabel: (isDesigner) => isDesigner ? "Przychodzące" : "Wysłane",
      sendSavedBrief: "Wyślij zapisany brief",
      statusGuide: "Przewodnik po statusach zapytań",
      statusGuideBody: { sent: "Zapytanie czeka na sprawdzenie przez projektanta.", reviewing: "Projektant sprawdza dopasowanie i zakres.", accepted: "Projektant jest zainteresowany projektem.", declined: "Projekt nie pasuje teraz do zakresu lub dostępności." },
      updatedTitle: "Zapytanie zaktualizowane",
      updatedBody: "Klient widzi już najnowszy status.",
      cancelledTitle: "Zapytanie anulowane",
      cancelledBody: "Zapisany brief nadal jest dostępny, jeśli zechcesz wysłać go ponownie.",
      actionError: "Nie udało się wykonać działania na zapytaniu",
      sentTitle: "Wysłane zapytania",
      incomingTitle: "Przychodzące zapytania",
      sentEmptyTitle: "Nie masz jeszcze wysłanych zapytań",
      sentEmptyBody: "Wyślij zapisany brief AI Project Compass, gdy będziesz gotowy do kontaktu z projektantem.",
      incomingEmptyTitle: "Nie ma jeszcze zapytań",
      incomingEmptyBody: "Gdy klient wyśle zapisany brief do Twojego profilu, pojawi się tutaj. Utrzymuj profil publiczny w gotowości na pierwsze wartościowe zapytanie.",
      viewPublicProfile: "Zobacz profil publiczny",
      editProfile: "Edytuj profil",
    },
    conversation: {
      errors: { messageOrFile: "Wpisz wiadomość albo dodaj plik", messageTooLong: "Wiadomość jest zbyt długa" },
      attachmentsShared: "Udostępniono załączniki",
      client: "Klient",
      designerFallback: "Projektant wnętrz",
      you: "Ty",
      back: "Wróć do wiadomości",
      with: (name) => `Rozmowa z: ${name}`,
      openStudio: "Otwórz profil pracowni",
      openDesigner: "Otwórz profil projektanta",
      sent: "Wiadomość została wysłana.",
      messages: "Wiadomości",
      refresh: "Odśwież",
      firstMessage: "pierwsza wiadomość",
      read: "Przeczytano",
      reply: "Odpowiedź",
      replyPlaceholder: "Napisz wiadomość...",
      attachments: "Dodaj plany lub dokumenty",
      attachmentLimit: "maksymalnie 5 plików, do 20 MB każdy",
      sendMessage: "Wyślij wiadomość",
      sending: "Wysyłanie...",
      referencePhotos: "Zdjęcia referencyjne z briefu",
      openFullBrief: "Otwórz pełną treść briefu",
    },
  },
  en: {
    dateLocale: "en-GB",
    common: {
      defaultProfessional: "ArchiCompass professional",
      designer: "Designer",
      studio: "Design studio",
      notProvided: "Not specified",
      noTags: "No tags",
      projectBrief: "Project brief",
    },
    brief: {
      errors: {
        designerRole: "A designer account can receive briefs but cannot send enquiries as a client.",
        selectBrief: "Select a saved brief first.",
        selectRecipient: "Choose a designer or studio before sending the brief.",
        invalidRecipient: "Choose a valid designer or studio profile.",
        ownProfile: "Choose another designer, not your own profile.",
        briefMissing: "The selected saved brief could not be found.",
        studioMissing: "This studio profile could not be found.",
        designerMissing: "This designer profile could not be found.",
        duplicate: "This brief has already been sent to the selected professional.",
        alreadySentCannotDelete: "This brief has already been sent. Cancel the enquiry before deleting the brief.",
      },
      studioProfession: "Design studio",
      subject: (name) => `Project enquiry: ${name}`,
      workspaceLabel: (isClient) => isClient ? "View sent enquiries" : "Open Designer Studio",
      back: "Back to account",
      eyebrow: "AI Project Compass",
      title: (isClient) => isClient ? "Saved briefs" : "Analysis history",
      intro: (isClient) => isClient
        ? "Review briefs created in AI Project Compass and send one to a designer or studio as a clear first enquiry."
        : "Return to earlier inspiration analyses. Designers can use AI Project Compass, but they do not send briefs as clients.",
      countLabel: (isClient) => isClient ? "Saved briefs" : "Saved analyses",
      create: "Create a new brief",
      analyse: "Analyse inspiration",
      designerModeTitle: "Designer account mode",
      designerModeBody: "This account receives project enquiries in Designer Studio. You can analyse inspiration in AI Project Compass, but sending briefs is reserved for client accounts.",
      sentTitle: "Brief sent",
      sentBody: "The enquiry has been saved in ArchiCompass. You can review it in the enquiries section.",
      deletedTitle: "Brief deleted",
      deletedBody: "The saved brief and private reference photos have been deleted.",
      actionError: "The brief action could not be completed",
      emptyTitle: "You do not have any saved briefs yet",
      emptyBody: "Create an AI Project Compass brief with a style direction, visual cues, and reference photos, then save it here.",
      created: (value) => `Saved ${value}`,
      selected: "Selected brief",
      photoCount: (count) => `${count} ${count === 1 ? "photo" : "photos"}`,
      fields: {
        goal: "Goal", style: "Styles", scope: "Scope", budget: "Budget", timeline: "Timeline", area: "Area", roomCount: "Number of rooms", rooms: "Rooms", propertyStatus: "Property status", visualization: "3D visualisation", supervision: "Supervision", location: "Location", visualCues: "Visual cues",
      },
      referencePhotos: "Brief reference photos",
      sendPanelTitle: (isClient) => isClient ? "Send this brief" : "Brief for analysis",
      sendPanelBody: (isClient) => isClient
        ? "Choose a designer or studio and add a short message. The full brief will be saved with the enquiry."
        : "This entry remains a private analysis history. You can find client enquiries in Designer Studio.",
      recipient: "Recipient",
      recipientPlaceholder: "Choose a designer or studio",
      independentDesigners: "Independent designers",
      studios: "Design studios",
      message: "Message",
      messagePlaceholder: "Hello, I prepared an AI Project Compass brief and would like to check whether this project fits your scope of work.",
      send: "Send brief",
      designerCannotSend: "Designer accounts cannot send briefs as clients.",
      noRecipients: "There are no available designer or studio profiles yet.",
      alreadySent: "Already sent",
      matchingDesigners: "Find matching designers",
      createAnother: "Create another brief",
      deleteSummary: "Delete saved brief",
      deleteBody: "This will delete the saved brief and private reference photos. Briefs already sent to designers must be cancelled first.",
      delete: "Delete this brief",
    },
    inquiries: {
      statuses: { accepted: "Accepted", declined: "Declined", reviewing: "Under review", sent: "Sent" },
      errors: { missing: "The enquiry could not be found.", invalidStatus: "Choose a valid enquiry status.", receiverOnly: "Only the enquiry recipient can change its status.", senderOnly: "Only the enquiry sender can cancel it." },
      sentTo: "Sent to",
      inquiryFrom: "Enquiry from",
      sentOn: (value) => `Sent ${value}`,
      fields: { project: "Project", styles: "Styles", scope: "Scope", budget: "Budget", timeline: "Timeline", area: "Area", rooms: "Rooms", property: "Property", visualisation: "3D", supervision: "Supervision", location: "Location", goal: "Goal" },
      referencePhotos: "Enquiry reference photos",
      openConversation: "Open conversation",
      openDesignerProfile: "Open designer profile",
      replyByEmail: "Reply by email",
      statusLabel: "Enquiry status",
      updateStatus: "Update status",
      cancelSummary: "Cancel enquiry",
      cancelBody: "This will remove the enquiry from ArchiCompass. The saved brief will remain available in AI Project Compass.",
      cancel: "Cancel this enquiry",
      back: "Back to account",
      eyebrow: "Project enquiries",
      title: "Brief enquiries",
      intro: (isDesigner) => isDesigner ? "Review briefs and messages sent to your professional profile." : "Track project briefs and conversations started with designers.",
      countLabel: (isDesigner) => isDesigner ? "Incoming" : "Sent",
      sendSavedBrief: "Send a saved brief",
      statusGuide: "Enquiry status guide",
      statusGuideBody: { sent: "The enquiry is waiting for the designer to review it.", reviewing: "The designer is reviewing the fit and scope.", accepted: "The designer is interested in the project.", declined: "The project does not currently fit their scope or availability." },
      updatedTitle: "Enquiry updated",
      updatedBody: "The client can now see the latest status.",
      cancelledTitle: "Enquiry cancelled",
      cancelledBody: "The saved brief is still available if you want to send it again.",
      actionError: "The enquiry action could not be completed",
      sentTitle: "Sent enquiries",
      incomingTitle: "Incoming enquiries",
      sentEmptyTitle: "You have not sent any enquiries yet",
      sentEmptyBody: "Send a saved AI Project Compass brief when you are ready to contact a designer.",
      incomingEmptyTitle: "There are no enquiries yet",
      incomingEmptyBody: "When a client sends a saved brief to your profile, it will appear here. Keep your public profile ready for the first useful enquiry.",
      viewPublicProfile: "View public profile",
      editProfile: "Edit profile",
    },
    conversation: {
      errors: { messageOrFile: "Write a message or add a file", messageTooLong: "The message is too long" },
      attachmentsShared: "Attachments shared",
      client: "Client",
      designerFallback: "Interior designer",
      you: "You",
      back: "Back to messages",
      with: (name) => `Conversation with: ${name}`,
      openStudio: "Open studio profile",
      openDesigner: "Open designer profile",
      sent: "Message sent.",
      messages: "Messages",
      refresh: "Refresh",
      firstMessage: "first message",
      read: "Read",
      reply: "Reply",
      replyPlaceholder: "Write a message...",
      attachments: "Add plans or documents",
      attachmentLimit: "up to 5 files, 20 MB each",
      sendMessage: "Send message",
      sending: "Sending...",
      referencePhotos: "Brief reference photos",
      openFullBrief: "Open full brief",
    },
  },
};

export function getAccountFlowCopy(locale: SiteLocale = siteLocale) {
  return accountFlowCopy[locale];
}
