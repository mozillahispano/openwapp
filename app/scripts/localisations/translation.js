define([], function () {
  'use strict';

  return {
    es: {
      all: 'Todos',
      contacts: 'Contactos',
      noContacts: 'No tiene contactos',
      jan: 'Ene',
      feb: 'Feb',
      mar: 'Mar',
      apr: 'Abr',
      may: 'May',
      jun: 'Jun',
      jul: 'Jul',
      aug: 'Ago',
      sep: 'Sep',
      oct: 'Oct',
      nov: 'Nov',
      dic: 'Dic',
      offline: 'desconectado',
      online: 'conectado',
      connecting: 'conectando',
      oldAppAlert: 'Esta versión no está soportada. Por favor, actualícela ' +
      'en el Firefox Marketplace para disfrutar de la nueva funcionalidad.',
      selectCountryAlert: 'Por favor, seleccione un país.',
      movilNumberValidationAlert: 'El número de móvil:\n' +
      '+{{prefix}} {{number}}\nno parece un número de {{country}} válido.\n ' +
      '¿Quieres seguir de todas formas?',
      registerErrorObjectAlert: 'Se ha producido un error al registrar su ' +
      'número de móvil.\n Por favor, compruebe su conectividad.',
      registerError429Alert: 'Se ha producido un error al registrar su ' +
      'número de móvil.\n Por favor, contacte con el servicio de asistencia.',
      registerErrorGenericAlert: 'Se ha producido un error al registrar su ' +
      'número de móvil.\n Por favor, reinténtelo más tarde.',
      registerErrorTooRecent: 'Es demasiado pronto para solicitar otro código' +
      ' de registro. Comprueba que no te ha llegado el mensaje de ' +
      'confirmación. Si es así, espera un poco o vuelve a intentar registrar ' +
      'tu número pasados {{minutes}} minutos',
      pinInvalidAlert: 'PIN no válido.',
      screenNameAlert: 'Su nombre de pantalla no puede estar vacío.',
      inbox: 'Chats',
      noConversation: 'No hay conversaciones.',
      selectContacts: 'Escoja contactos de la lista de contactos de OpenWapp ' +
      'para comenzar a chatear.',
      removeGroupConversation: '¿Quiere abandonar el grupo {{groupTitle}} y ' +
      'eliminar la conversación?',
      remove1to1Conversation: '¿Quiere eliminar la conversación con {{who}}?',
      removeMessage: '¿Quiere eliminar este mensaje?',
      today: 'Hoy',
      yesterday: 'Ayer',
      before: 'Anterior',
      settings: 'Más',
      profile: 'Perfil',
      profileExplanation: 'Desde aquí puede establecer su nombre, estado y ' +
      'foto de contacto:',
      openWapp: 'OpenWapp',
      loading: 'Cargando…',
      loadingConversations: 'Cargando conversaciones…',
      registerOpenWapp: 'Registro en OpenWapp',
      welcomeMessage1: 'Bienvenido a OpenWapp.',
      welcomeMessage2: 'Registrarse es muy fácil y rápido.',
      insertMobileNumber: 'Por favor, introduzca su número de móvil',
      countryDetectedOnLogin: 'Tiene un teléfono de {{country}}. Si no es ' +
      'correcto, cámbielo en el selector.',
      countryNotDetectedOnLogin: 'Por favor, elija su país para continuar',
      country: 'País',
      yourNumberPlaceHolder: 'Su número',
      nextButton: 'Siguiente',
      backButton: 'Atrás',
      reEnterPhone: 'Registrar otro teléfono',
      goToValidateButton: '¡Ya tengo el código!',
      smsValMessage: 'Gracias, ahora vamos a tratar de validar su número de ' +
      'teléfono:',
      codePlaceholder: 'Código',
      sendingValCode: 'Validando número…',
      loginEditIncorrect: 'Pulse para editar si su número no es correcto.',
      loginNumberOk: 'Pulse Aceptar si el número es correcto.',
      acceptButton: 'Aceptar',
      name: 'Nombre',
      settingsGeneral: 'General',
      settingsAbout: 'Acerca de',
      settingsVersion: 'Versión',
      logout: 'Cerrar sesión',
      validateCode: 'Por favor, introduzca el código que ha recibido por ' +
      'SMS al',
      validateCodeProgress: 'Verificando código…',
      validateCodeCall: 'Llamar con el código',
      settingAccount: 'Configurando la cuenta…',
      pictureDescription: 'Elija la imagen para mostrar como foto de contacto',
      screenNamePlaceHolder: 'Su nombre',
      screenNameDescription: 'Esto aparecerá como su nombre de contacto',
      statusPlaceHolder: 'Me siento…',
      statusDescription: 'Esto aparecerá como su estado de contacto',
      doneButton: 'Hecho',
      pending: 'pendiente',
      sent: 'enviado',
      unsent: 'sin enviar',
      defaultImageCaption: 'Imagen sin título',
      received: 'recibido',
      composeImageCaptionPlaceholder: 'Añadir título',
      sendButton: 'Enviar',
      loadImageError: 'No se puede cargar la imagen ahora, vuelva a ' +
      'intentarlo más tarde.',
      sendingImage: 'Enviando',
      audioMessageSent: 'Audio enviado',
      audioMessageReceived: 'Audio recibido',
      loadAudioError: 'No se puede cargar el archivo ahora.' +
      '\n Vuelva a intentarlo más tarde.',
      sendLocation: 'Enviar ubicación',
      loadLocationError: 'Lo sentimos. No se puede cargar la ubicación ' +
      'ahora. \n Por favor, vuelva a intentarlo más tarde.',
      retrievingLocation: 'Cargando ubicación…',
      cancelButton: 'Cancelar',
      currentLocation: 'Mi ubicación',
      logoutAlertText: 'Utilice esta opción sólo si desea eliminar OpenWapp ' +
      'de este dispositivo para iniciar sesión en OpenWapp desde otro ' +
      'dispositivo. Para desconectarse, simplemente salga de OpenWapp ' +
      'y quedará inactivo automáticamente.',
      savePicture: 'Guardar',
      sdCardUnavailable: 'La tarjeta de memoria SD no está disponible',
      pictureSavePrompt: '¿Quieres guardar la foto en la Galería?',
      pictureSaveInfo: 'Guardada',
      pictureSaveError: 'Se ha producido un error guardando la foto',
      migrationHeader: 'Actualización de OpenWapp',
      migrationBody: 'OpenWapp está finalizando la actualización a la nueva ' +
      'version',
      migrationPleaseWait: 'Espere por favor',
      conversationLastSeen: 'Visto por última vez:',
      conversationIsOnline: 'Disponible',
      loadingParticipants: 'Cargando contactos…',
      invite: 'Invitar a WhatsApp',
      tellAFriendText: 'Consigue WhatsApp Messenger para Android, iPhone, ' +
      'Nokia, BlackBerry, Windows Phone y ahora también para Firefox OS! ' +
      'Descárgalo hoy de http://whatsapp.com/dl/',
      emojiListTitle: 'Escoja un emoji para enviar',
      contactProfile: 'Perfil del contacto',
      newGroup: 'Nuevo grupo',
      groupProfile: 'Info del grupo',
      leaveGroup: 'Abandonar grupo',
      groupPictureDescription: 'Elija la imagen del grupo',
      subjectPlaceHolder: 'Este grupo trata de…',
      subjectDescription: 'Indique brevemente de qué trata el grupo',
      participants: 'Participantes',
      unknownParticipant: 'Participante desconocido',
      participantsDescription: 'Elija los participantes para este grupo',
      addParticipant: 'Añadir participante',
      removeParticipant: 'Eliminar participante',
      image: 'Imagen',
      video: 'Video',
      audio: 'Audio',
      notificationSubjectChanged: '{{who}} cambió el tema del grupo a:\n' +
                                  '{{subject}}',
      notificationSubjectChangedByYou: 'Cambiaste el tema del grupo a:\n' +
                                       '{{subject}}',
      notificationGroupParticipantAdded: '{{who}} se unió al grupo',
      notificationGroupParticipantRemoved: '{{who}} abandonó el grupo',
      notificationGroupPictureUpdated: '{{who}} cambió la foto del grupo',
      notificationGroupPictureUpdatedByYou: 'Cambiaste la foto del grupo',
      notificationGroupPictureRemoved: '{{who}} eliminó la foto del grupo',
      notificationGroupPictureRemovedByYou: 'Eliminaste la foto del grupo',
      notificationReportTitle: 'Tienes {{count}} mensajes sin leer.',
      notificationReportBody: 'De {{count}} conversaciones.',
      inAppNotification: '{{title}}: {{body}}',
      wakeUpTime: 'Comprobar nuevos mensajes…',
      wakeUpDescription: 'Periodos más cortos consumen más batería.',
      eachMinute: 'Cada minuto',
      each5Minutes: 'Cada 5 minutos',
      each10Minutes: 'Cada 10 minutos',
      each20Minutes: 'Cada 20 minutos',
      each30Minutes: 'Cada 30 minutos',
      eachHour: 'Cada hora',
      disabled: 'No comprobar',
      termsOfUse: 'Términos y condiciones',
      fileTooLargeToBeSent: 'El archivo es demasiado grande. El límite para ' +
                            'enviar archivos es de 10MiB.',
      errorAddingParticipant: 'No se puede añadir este contacto al grupo',
      genericConnectionProblem: 'Hubo un error inesperado. ¿Estás seguro de ' +
            'que tienes red? Prueba a reiniciar OpenWapp y si sigue ' +
            'ocurriendo, intenta la operación más tarde',
      participatingInTooMuchGroups: 'Estás participando en demasiados grupos.' +
            ' El límite es 50. Por favor, abandona uno antes de crear otro',
      accountExpired: 'Su cuenta ha caducado. ¿Desea actualizar su cuenta?',
      accountExpiration: 'Fecha de expiración',
      upgradeNow: 'Actualizar ahora',
      notSquarePicture: 'La imagen seleccionada no es cuadrada. Esto hará que' +
      ' aparezcan bandas de relleno alrededor. Si quieres arreglarlo, ' +
      'abre la aplicación de Galería y edita y recorta la imagen para que ' +
      'tenga un aspecto 1:1'
    },
    'en-US': {
      all: 'All',
      contacts: 'Contacts',
      noContacts: 'You have no contacts',
      jan: 'Jan',
      feb: 'Feb',
      mar: 'Mar',
      apr: 'Apr',
      may: 'May',
      jun: 'Jun',
      jul: 'Jul',
      aug: 'Aug',
      sep: 'Sep',
      oct: 'Oct',
      nov: 'Nov',
      dic: 'Dec',
      offline: 'offline',
      online: 'online',
      connecting: 'connecting',
      oldAppAlert: 'This version is not supported. Please update it ' +
      'from the Firefox Marketplace to enjoy new functionality.',
      selectCountryAlert: 'Please select a country.',
      movilNumberValidationAlert: 'The mobile number:\n' +
      '+{{prefix}} {{number}}\ndoes not seem to be a valid number from ' +
      '{{country}}.\nDo you want to continue in any case?',
      registerErrorObjectAlert: 'There was an error registering ' +
      'your number.\n Please check your connectivity settings.',
      registerError429Alert: 'There was an error registering your number.\n' +
      ' Please contact technical support.',
      registerErrorGenericAlert: 'There was an error registering your number.' +
      ' \n Please try again later.',
      registerErrorTooRecent: 'It is too early to request another ' +
      'registration code.\nCheck that you have not received the confirmation ' +
      'message. If so, wait a little bit or try to register in {{minutes}} ' +
      'minutes',
      pinInvalidAlert: 'PIN not recognized. Please try again.',
      screenNameAlert: 'Please enter your name.',
      inbox: 'Inbox',
      noConversation: 'No conversations.',
      selectContacts: 'Pick a contact in the OpenWapp contact list to ' +
      'start chatting.',
      removeGroupConversation: 'Do you want to leave the group {{groupTitle}}' +
      ' and delete the conversation?',
      remove1to1Conversation: 'Do you want to delete the conversation ' +
      ' with {{who}}?',
      removeMessage: 'Do you want to remove this message?',
      today: 'Today',
      yesterday: 'Yesterday',
      before: 'Older',
      settings: 'Settings',
      profile: 'Profile',
      profileExplanation: 'Here you can set your contact name, status and ' +
      'contact picture:',
      openWapp: 'OpenWapp',
      loading: 'Loading…',
      loadingConversations: 'Loading conversations…',
      registerOpenWapp: 'OpenWapp Sign-up',
      welcomeMessage1: 'Welcome to OpenWapp.',
      welcomeMessage2: 'Registering is very quick and easy.',
      insertMobileNumber: 'Please enter your mobile number.',
      countryDetectedOnLogin: 'You have a {{country}} phone number. ' +
      'Change it if it is not correct',
      countryNotDetectedOnLogin: 'Please, select your country below',
      country: 'Country',
      yourNumberPlaceHolder: 'Mobile number',
      nextButton: 'Next',
      backButton: 'Back',
      reEnterPhone: 'Register another phone',
      goToValidateButton: 'I already have the code!',
      smsValMessage: 'Thanks, now we will try to validate your number:',
      codePlaceholder: 'PIN',
      sendingValCode: 'Validating number…',
      loginEditIncorrect: 'Tap to edit if your number is incorrect.',
      loginNumberOk: 'Press OK if your number is correct.',
      acceptButton: 'OK',
      name: 'Your name',
      settingsGeneral: 'General',
      settingsAbout: 'About',
      settingsVersion: 'Version',
      logout: 'Log out',
      validateCode: 'Please enter the PIN you received ' +
      'via SMS to',
      validateCodeProgress: 'Verifying code…',
      validateCodeCall: 'Call me with the code',
      settingAccount: 'Setting up your account…',
      pictureDescription: 'Choose an image to show as your contact\'s ' +
      'picture',
      screenNamePlaceHolder: 'Your name',
      screenNameDescription: 'This will appear as your contact name',
      statusPlaceHolder: 'I\'m feeling…',
      statusDescription: 'This will appear as your contact status',
      doneButton: 'Done',
      pending: 'pending',
      sent: 'sent',
      unsent: 'unsent',
      defaultImageCaption: 'Image',
      received: 'received',
      composeImageCaptionPlaceholder: 'Add a caption',
      sendButton: 'Send',
      loadImageError: 'The image can\'t be loaded at the moment.\n Please ' +
      'try again later.',
      sendingImage: 'Sending',
      audioMessageSent: 'Audio sent',
      audioMessageReceived: 'Audio received',
      loadAudioError: 'The file can\'t be loaded at the moment.\n Please ' +
      'try again later.',
      sendLocation: 'Send location',
      loadLocationError: 'The location can\'t be loaded at the moment.\n' +
      'Please try again later.',
      retrievingLocation: 'Retrieving location…',
      cancelButton: 'Cancel',
      currentLocation: 'My current location',
      logoutAlertText: 'Use this option only if you want to clear OpenWapp ' +
      'from this device to log into OpenWapp on a different device. ' +
      'To go offline, simply switch away from OpenWapp and ' +
      'it will go to sleep automatically.',
      savePicture: 'Save',
      sdCardUnavailable: 'Memory card is not available.',
      pictureSavePrompt: 'Do you want to save this photo to the Gallery?',
      pictureSaveInfo: 'Saved',
      pictureSaveError: 'There was an error while saving the photo.',
      migrationHeader: 'OpenWapp update',
      migrationBody: 'OpenWapp is finishing updating to the new version.',
      migrationPleaseWait: 'Please wait',
      conversationLastSeen: 'Last seen:',
      conversationIsOnline: 'Online',
      loadingParticipants: 'Loading contacts…',
      invite: 'Invite to WhatsApp',
      tellAFriendText: 'Check out WhatsApp Messenger for Android, iPhone, ' +
      'Nokia, BlackBerry, Windows Phone and now Firefox OS! Download it ' +
      'today from http://whatsapp.com/dl/',
      emojiListTitle: 'Choose an emoji to send',
      contactProfile: 'Contact Profile',
      newGroup: 'New group',
      groupProfile: 'Group info',
      leaveGroup: 'Leave group',
      groupPictureDescription: 'Choose an image for the group',
      subjectPlaceHolder: 'This group is about…',
      subjectDescription: 'Briefly describe what is this group about',
      participants: 'Participants',
      unknownParticipant: 'Unknown participant',
      participantsDescription: 'Choose the participants of this group',
      addParticipant: 'Add participant',
      removeParticipant: 'Remove participant',
      image: 'Image',
      video: 'Video',
      audio: 'Audio',
      you: 'You',
      notificationSubjectChanged: '{{who}} changed the subject of the group ' +
                                  'to:\n{{subject}}',
      notificationSubjectChangedByYou: 'You changed the subject of the group ' +
                                       'to:\n{{subject}}',
      notificationGroupParticipantAdded: '{{who}} joined the group',
      notificationGroupParticipantRemoved: '{{who}} left the group',
      notificationGroupPictureUpdated: '{{who}} changed the group picture',
      notificationGroupPictureUpdatedByYou: 'You changed the group picture',
      notificationGroupPictureRemoved: '{{who}} removed the group picture',
      notificationGroupPictureRemovedByYou: 'You removed the group picture',
      notificationReportTitle: 'You have {{count}} new messages.',
      notificationReportBody: 'From {{count}} conversations.',
      inAppNotification: '{{title}}: {{body}}',
      wakeUpTime: 'Check for messages…',
      wakeUpDescription: 'Time period to check for new messages: shorter ' +
                         'times lead to higher battery consumption.',
      eachMinute: 'Each minute',
      each5Minutes: 'Each 5 minutes',
      each10Minutes: 'Each 10 minutes',
      each20Minutes: 'Each 20 minutes',
      each30Minutes: 'Each 30 minutes',
      eachHour: 'Each hour',
      disabled: 'Never',
      termsOfUse: 'Terms and conditions',
      fileTooLargeToBeSent: 'The file is too large. The limit for sending ' +
                            'files is 10MiB.',
      errorAddingParticipant: 'This contact can not be added to this group',
      genericConnectionProblem: 'There was an unexpected problem. Are you ' +
            'sure you are connected? Try to close and open OpenWapp. If the ' +
            'behaviour keep reproducing, try again later.',
      participatingInTooMuchGroups: 'You are participating in too much groups' +
      '. The limit is 50. You must leave one group before starting another ' +
      'one.',
      accountExpired: 'Your account has expired. Do you want to upgrade ' +
                         'your account now?',
      accountExpiration: 'Expiration date',
      upgradeNow: 'Upgrade now',
      notSquarePicture: 'The selected image is not square. This will make to ' +
      'appear padding bands around. If you want to fix it, go to the ' +
      'Gallery, and edit and crop the photo, using a 1:1 aspect ratio.'
    },
    pt : {
      all: 'Tudo',
      contacts: 'Contatos',
      noContacts: 'Não tem contatos',
      jan: 'Jan',
      feb: 'Fev',
      mar: 'Mar',
      apr: 'Abr',
      may: 'Mai',
      jun: 'Jun',
      jul: 'Jul',
      aug: 'Ago',
      sep: 'Set',
      oct: 'Out',
      nov: 'Nov',
      dic: 'Dez',
      offline: 'offline',
      online: 'online',
      connecting: 'conectando',
      oldAppAlert: 'Esta versão não está suportada. Favor atualizar ' +
      'no Firefox Marketplace para aproveitar a nova funcionalidade.',
      selectCountryAlert: 'Por favor, selecione um país.',
      movilNumberValidationAlert: 'O número de celular:\n' +
      '+{{prefix}} {{number}}\nnão parece um número válido de {{country}}.\n ' +
      'De qualquer forma, você quer continuar?',
      registerErrorObjectAlert: 'Houve um erro ao cadastrar' +
      'seu número.\n Por favor, verifique sua conexão.',
      registerError429Alert: 'Houve um erro ao cadastrar ' +
      'seu número.\n Por favor, contate com o suporte.',
      registerErrorGenericAlert: 'Houve um erro ao cadastrar ' +
      'seu número.\n Por favor, tente novamente mais tarde.',
      registerErrorTooRecent: 'É muito cedo para solicitar outro código de ' +
      'registo. Verifique se você não tiver recebido a mensagem de ' +
      'confirmação. Se assim for, espere um pouco ou tentar registrar em ' +
      '{{minutes}} minutos.',
      pinInvalidAlert: 'PIN não válido.',
      screenNameAlert: 'Seu nome de usuário não pode estar vazio.',
      inbox: 'Caixa de entrada',
      noConversation: 'Não há conversas.',
      selectContacts: 'Escolha contatos da lista de contatos de OpenWapp ' +
      'para começar uma conversa.',
      removeGroupConversation: 'Você quer deixar o grupo {{groupTitle}} e ' +
      'retire a conversa?',
      remove1to1Conversation: 'Você quer remover a conversa com {{who}}?',
      removeMessage: 'Você quer remover esta mensagem?',
      today: 'Hoje',
      yesterday: 'Ontem',
      before: 'Anterior',
      settings: 'Mais',
      profile: 'Perfil',
      profileExplanation: 'Aqui você pode definir o nome do contato, status ' +
      'e imagem de contato:',
      openWapp: 'OpenWapp',
      loading: 'Carregando…',
      loadingConversations: 'Carregando conversas…',
      registerOpenWapp: 'Cadastro no OpenWapp',
      welcomeMessage1: 'Bem vindo ao OpenWapp.',
      welcomeMessage2: 'Se cadastrar é muito fácil e rápido.',
      insertMobileNumber: 'Por favor, insira seu número de celular',
      countryDetectedOnLogin: 'Você tem um {{país}} número de telefone. ' +
      'Mude-se não é correto',
      countryNotDetectedOnLogin: 'Por favor, selecione seu país abaixo',
      country: 'País',
      yourNumberPlaceHolder: 'Seu número',
      nextButton: 'Seguinte',
      backButton: 'Atrás',
      reEnterPhone: 'Registar-se um outro telefone',
      goToValidateButton: 'Eu já tenho o código!',
      smsValMessage: 'Obrigado, aagora vamos tentar validar o seu número:',
      codePlaceholder: 'Código',
      sendingValCode: 'Verificando número…',
      loginEditIncorrect: 'Aperte para editar se seu número não for correto.',
      loginNumberOk: 'Aperte Aceitar se o número é correto.',
      acceptButton: 'Aceitar',
      name: 'Nome',
      settingsGeneral: 'Geral',
      settingsAbout: 'Sobre',
      settingsVersion: 'Versão',
      logout: 'Sair',
      validateCode: 'Por favor, inserir o código que foi recebido por ' +
      'SMS a ',
      validateCodeProgress: 'Verificando código…',
      validateCodeCall: 'Ligar com o código',
      settingAccount: 'Configurando a conta…',
      pictureDescription: 'Escolha a foto para mostrar como a foto do contato',
      screenNamePlaceHolder: 'Seu nome',
      screenNameDescription: 'Isto aparecerá como seu nome de usuário',
      statusPlaceHolder: 'Estou…',
      statusDescription: 'Isto aparecerá como seu status de usuário',
      doneButton: 'Feito',
      pending: 'pendente',
      sent: 'enviado',
      unsent: 'não enviado',
      defaultImageCaption: 'Sem legenda',
      received: 'recebido',
      composeImageCaptionPlaceholder: 'Adicionar uma legenda',
      sendButton: 'Enviar',
      loadImageError: 'Não é possível obter a imagen.' +
      '\n Tentar novamente mais tarde.',
      sendingImage: 'Enviando',
      audioMessageSent: 'Audio enviado',
      audioMessageReceived: 'Audio recebido',
      loadAudioError: 'Não é possível obter a arquivo.' +
      '\n Tentar novamente mais tarde.',
      sendLocation: 'Enviar localização',
      loadLocationError: 'Lamentamos, não é possível obter a sua ' +
      'localização.\n Por favor, tentar novamente mais tarde.',
      retrievingLocation: 'Carregando localização…',
      cancelButton: 'Cancelar',
      currentLocation: 'Localização actual',
      logoutAlertText: 'Utilizar esta opção apenas se pretende eliminar ' +
      'OpenWapp deste dispositivo para iniciar sessão OpenWapp num ' +
      'dispositivo diferente. Para entrar em modo offline, basta desligar ' +
      'OpenWapp e este entrará automaticamente em modo de repouso.',
      savePicture: 'Salvar',
      sdCardUnavailable: 'Nenhum cartão de memória disponível',
      pictureSavePrompt: 'Deseja salvar esta foto na galeria?',
      pictureSaveInfo: 'Guardada',
      pictureSaveError: 'Ocorreu um erro ao salvar a foto. Por favor, tente ' +
      'novamente mais tarde.',
      migrationHeader: 'Atualização do OpenWapp',
      migrationBody: 'OpenWapp está finalizando a atualização da nova versão.',
      migrationPleaseWait: 'Aguarde por favor',
      conversationLastSeen: 'Visto pela última vez:',
      conversationIsOnline: 'Disponível',
      loadingParticipants: 'Carregando contatos…',
      invite: 'Convidar para WhatsApp',
      tellAFriendText: 'Check out WhatsApp Messenger for Android, iPhone, ' +
      'Nokia, BlackBerry, Windows Phone and now Firefox OS! Download it ' +
      'today from http://whatsapp.com/dl/',
      emojiListTitle: 'Escolher um emoji para enviar',
      contactProfile: 'Perfil de contato',
      newGroup: 'Novo grupo',
      groupProfile: 'Info do grupo',
      leaveGroup: 'Sair do grupo',
      groupPictureDescription: 'Escolher e imagem para o grupo',
      subjectPlaceHolder: 'Este grupo é sobre…',
      subjectDescription: 'Descrevem o que é o objecto do presente grupo',
      participants: 'Participantes',
      unknownParticipant: 'Participante desconhecido',
      participantsDescription: 'Escolher os participantes de seu grupo',
      addParticipant: 'Adicionar participante',
      removeParticipant: 'Remover participante',
      image: 'Imagem',
      video: 'Vídeo',
      audio: 'Áudio',
      notificationSubjectChanged: '{{who}} mudou o objecto do grupo a:\n' +
                                  '{{subject}}',
      notificationSubjectChangedByYou: 'Você mudou o objecto do grupo a:\n' +
                                       '{{subject}}',
      notificationGroupParticipantAdded: '{{who}} se juntou ao grupo',
      notificationGroupParticipantRemoved: '{{who}} deixou o grupo',
      notificationGroupPictureUpdated: '{{who}} mudou a foto de grupo',
      notificationGroupPictureUpdatedByYou: 'Você mudou a foto de grupo',
      notificationGroupPictureRemoved: '{{who}} removido a foto de grupo',
      notificationGroupPictureRemovedByYou: 'Você removido a foto de grupo',
      notificationReportTitle: 'Você tem {{count}} mensagens não lidas.',
      notificationReportBody: 'A partir de {{count}} conversas.',
      inAppNotification: '{{title}}: {{body}}',
      wakeUpTime: 'Verificar as mensagens recebidas…',
      wakeUpDescription: 'Menor tempo de levar a um maior consumo de bateria',
      eachMinute: 'Cada minuto',
      each5Minutes: 'Cada 5 minutos',
      each10Minutes: 'Cada 10 minutos',
      each20Minutes: 'Cada 20 minutos',
      each30Minutes: 'Cada 30 minutos',
      eachHour: 'Cada hora',
      disabled: 'Nunca',
      termsOfUse: 'Termos e condições',
      fileTooLargeToBeSent: 'O arquivo é muito grande. O limite para o envio ' +
                            'de arquivos é 10MiB.',
      errorAddingParticipant: 'Este contacto não pode ser acrescentado ' +
            'a este grupo',
      genericConnectionProblem: 'Houve um problema inesperado. Tem certeza ' +
            'que você está conectado? Tente fechar e abrir OpenWapp. Se o ' +
            'comportamento continuar reproduzindo, tente novamente mais tarde.',
      participatingInTooMuchGroups: 'Está muito adicionado em grupos. O ' +
      'limite é de 50. Você deve deixar um grupo antes de iniciar outra.',
      accountExpired: 'Sua conta expirou. Você quer atualizar a sua conta ' +
                         'agora?',
      accountExpiration: 'Data de validade',
      upgradeNow: 'Actualizar agora',
      notSquarePicture: 'A imagem selecionada não é quadrado. Isso fará com ' +
      'que apareçam faixas ao redor. Se você quiser corrigi-lo, ' +
      'vá até a Galeria e editar e cortar a foto, usando uma relação de ' +
      'aspecto de 1:1.'
    },
    'pt-BR' : {
      all: 'Tudo',
      contacts: 'Contatos',
      noContacts: 'Não tem contatos',
      jan: 'Jan',
      feb: 'Fev',
      mar: 'Mar',
      apr: 'Abr',
      may: 'Mai',
      jun: 'Jun',
      jul: 'Jul',
      aug: 'Ago',
      sep: 'Set',
      oct: 'Out',
      nov: 'Nov',
      dic: 'Dez',
      offline: 'offline',
      online: 'online',
      connecting: 'conectando',
      oldAppAlert: 'Esta versão não está suportada. Favor atualizar ' +
      'no Firefox Marketplace para aproveitar a nova funcionalidade.',
      selectCountryAlert: 'Por favor, selecione um país.',
      movilNumberValidationAlert: 'O número de celular:\n' +
      '+{{prefix}} {{number}}\nnão parece um número válido de {{country}}.\n ' +
      'De qualquer forma, você quer continuar?',
      registerErrorObjectAlert: 'Houve um erro ao cadastrar' +
      'seu número.\n Por favor, verifique sua conexão.',
      registerError429Alert: 'Houve um erro ao cadastrar ' +
      'seu número.\n Por favor, contate com o suporte.',
      registerErrorGenericAlert: 'Houve um erro ao cadastrar ' +
      'seu número.\n Por favor, tente novamente mais tarde.',
      registerErrorTooRecent: 'É muito cedo para solicitar outro código de ' +
      'registo. Verifique se você não tiver recebido a mensagem de ' +
      'confirmação. Se assim for, espere um pouco ou tentar registrar em ' +
      '{{minutes}} minutos.',
      pinInvalidAlert: 'PIN não válido.',
      screenNameAlert: 'Seu nome de usuário não pode estar vazio.',
      inbox: 'Caixa de entrada',
      noConversation: 'Não há conversas.',
      selectContacts: 'Escolha contatos da lista de contatos de OpenWapp ' +
      'para começar uma conversa.',
      removeGroupConversation: 'Você quer deixar o grupo {{groupTitle}} e ' +
      'retire a conversa?',
      remove1to1Conversation: 'Você quer remover a conversa com {{who}}?',
      removeMessage: 'Você quer remover esta mensagem?',
      today: 'Hoje',
      yesterday: 'Ontem',
      before: 'Anterior',
      settings: 'Mais',
      profile: 'Perfil',
      profileExplanation: 'Aqui você pode definir o nome do contato, status ' +
      'e imagem de contato:',
      openWapp: 'OpenWapp',
      loading: 'Carregando…',
      loadingConversations: 'Carregando conversas…',
      registerOpenWapp: 'Cadastro no OpenWapp',
      welcomeMessage1: 'Bem vindo ao OpenWapp.',
      welcomeMessage2: 'Se cadastrar é muito fácil e rápido.',
      insertMobileNumber: 'Por favor, insira seu número de celular',
      countryDetectedOnLogin: 'Você tem um {{país}} número de telefone. ' +
      'Mude-se não é correto',
      countryNotDetectedOnLogin: 'Por favor, selecione seu país abaixo',
      country: 'País',
      yourNumberPlaceHolder: 'Seu número',
      nextButton: 'Seguinte',
      backButton: 'Atrás',
      reEnterPhone: 'Registar-se um outro telefone',
      goToValidateButton: 'Eu já tenho o código!',
      smsValMessage: 'Obrigado, aagora vamos tentar validar o seu número:',
      codePlaceholder: 'Código',
      sendingValCode: 'Verificando número…',
      loginEditIncorrect: 'Aperte para editar se seu número não for correto.',
      loginNumberOk: 'Aperte Aceitar se o número é correto.',
      acceptButton: 'Aceitar',
      name: 'Nome',
      settingsGeneral: 'Geral',
      settingsAbout: 'Sobre',
      settingsVersion: 'Versão',
      logout: 'Sair',
      validateCode: 'Por favor, inserir o código que foi recebido por ' +
      'SMS a ',
      validateCodeProgress: 'Verificando código…',
      validateCodeCall: 'Ligar com o código',
      settingAccount: 'Configurando a conta…',
      pictureDescription: 'Escolha a foto para mostrar como a foto do contato',
      screenNamePlaceHolder: 'Seu nome',
      screenNameDescription: 'Isto aparecerá como seu nome de usuário',
      statusPlaceHolder: 'Estou…',
      statusDescription: 'Isto aparecerá como seu status de usuário',
      doneButton: 'Feito',
      pending: 'pendente',
      sent: 'enviado',
      unsent: 'não enviado',
      defaultImageCaption: 'Sem legenda',
      received: 'recebido',
      composeImageCaptionPlaceholder: 'Adicionar uma legenda',
      sendButton: 'Enviar',
      loadImageError: 'Não é possível obter a imagen.' +
      '\n Tentar novamente mais tarde.',
      sendingImage: 'Enviando',
      audioMessageSent: 'Audio enviado',
      audioMessageReceived: 'Audio recebido',
      loadAudioError: 'Não é possível obter a arquivo.' +
      '\n Tentar novamente mais tarde.',
      sendLocation: 'Enviar localização',
      loadLocationError: 'Lamentamos, não é possível obter a sua ' +
      'localização.\n Por favor, tentar novamente mais tarde.',
      retrievingLocation: 'Carregando localização…',
      cancelButton: 'Cancelar',
      currentLocation: 'Localização actual',
      logoutAlertText: 'Utilizar esta opção apenas se pretende eliminar ' +
      'OpenWapp deste dispositivo para iniciar sessão OpenWapp num ' +
      'dispositivo diferente. Para entrar em modo offline, basta desligar ' +
      'OpenWapp e este entrará automaticamente em modo de repouso.',
      savePicture: 'Salvar',
      sdCardUnavailable: 'Nenhum cartão de memória disponível',
      pictureSavePrompt: 'Deseja salvar esta foto na galeria?',
      pictureSaveInfo: 'Guardada',
      pictureSaveError: 'Ocorreu um erro ao salvar a foto. Por favor, tente ' +
      'novamente mais tarde.',
      migrationHeader: 'Atualização do OpenWapp',
      migrationBody: 'OpenWapp está finalizando a atualização da nova versão.',
      migrationPleaseWait: 'Aguarde por favor',
      conversationLastSeen: 'Visto pela última vez:',
      conversationIsOnline: 'Disponível',
      loadingParticipants: 'Carregando contatos…',
      invite: 'Convidar para WhatsApp',
      tellAFriendText: 'Check out WhatsApp Messenger for Android, iPhone, ' +
      'Nokia, BlackBerry, Windows Phone and now Firefox OS! Download it ' +
      'today from http://whatsapp.com/dl/',
      emojiListTitle: 'Escolher um emoji para enviar',
      contactProfile: 'Perfil de contato',
      newGroup: 'Novo grupo',
      groupProfile: 'Info do grupo',
      leaveGroup: 'Sair do grupo',
      groupPictureDescription: 'Escolher e imagem para o grupo',
      subjectPlaceHolder: 'Este grupo é sobre…',
      subjectDescription: 'Descrevem o que é o objecto do presente grupo',
      participants: 'Participantes',
      unknownParticipant: 'Participante desconhecido',
      participantsDescription: 'Escolher os participantes de seu grupo',
      addParticipant: 'Adicionar participante',
      removeParticipant: 'Remover participante',
      image: 'Imagem',
      video: 'Vídeo',
      audio: 'Áudio',
      you: 'Tú',
      notificationSubjectChanged: '{{who}} mudou o objecto do grupo a:\n' +
                                  '{{subject}}',
      notificationSubjectChangedByYou: 'Você mudou o objecto do grupo a:\n' +
                                       '{{subject}}',
      notificationGroupParticipantAdded: '{{who}} se juntou ao grupo',
      notificationGroupParticipantRemoved: '{{who}} deixou o grupo',
      notificationGroupPictureUpdated: '{{who}} mudou a foto de grupo',
      notificationGroupPictureUpdatedByYou: 'Você mudou a foto de grupo',
      notificationGroupPictureRemoved: '{{who}} removido a foto de grupo',
      notificationGroupPictureRemovedByYou: 'Você removido a foto de grupo',
      notificationReportTitle: 'Você tem {{count}} mensagens não lidas.',
      notificationReportBody: 'A partir de {{count}} conversas.',
      inAppNotification: '{{title}}: {{body}}',
      wakeUpTime: 'Verificar as mensagens recebidas…',
      wakeUpDescription: 'Menor tempo de levar a um maior consumo de bateria',
      eachMinute: 'Cada minuto',
      each5Minutes: 'Cada 5 minutos',
      each10Minutes: 'Cada 10 minutos',
      each20Minutes: 'Cada 20 minutos',
      each30Minutes: 'Cada 30 minutos',
      eachHour: 'Cada hora',
      disabled: 'Nunca',
      termsOfUse: 'Termos e condições',
      fileTooLargeToBeSent: 'O arquivo é muito grande. O limite para o envio ' +
                            'de arquivos é 10MiB.',
      errorAddingParticipant: 'Este contacto não pode ser acrescentado ' +
            'a este grupo',
      genericConnectionProblem: 'Houve um problema inesperado. Tem certeza ' +
            'que você está conectado? Tente fechar e abrir OpenWapp. Se o ' +
            'comportamento continuar reproduzindo, tente novamente mais tarde.',
      participatingInTooMuchGroups: 'Está muito adicionado em grupos. O ' +
      'limite é de 50. Você deve deixar um grupo antes de iniciar outra.',
      accountExpired: 'Sua conta expirou. Você quer atualizar a sua conta ' +
                         'agora?',
      accountExpiration: 'Data de validade',
      upgradeNow: 'Actualizar agora',
      notSquarePicture: 'A imagem selecionada não é quadrado. Isso fará com ' +
      'que apareçam faixas ao redor. Se você quiser corrigi-lo, ' +
      'vá até a Galeria e editar e cortar a foto, usando uma relação de ' +
      'aspecto de 1:1.'
     },
     'it': {
     all: 'Tutti',
     contacts: 'Contatti',
     noContacts: 'Nessun contatto trovato',
     jan: 'Gen',
     feb: 'Feb',
     mar: 'Mar',
     apr: 'Apr',
     may: 'Mag',
     jun: 'Giu',
     jul: 'Lug',
     aug: 'Ago',
     sep: 'Set',
     oct: 'Ott',
     nov: 'Nov',
     dic: 'Dic',
     offline: 'offline',
     online: 'online',
     connecting: 'connessione',
     oldAppAlert: 'Questa versione non è supportata. Aggiornala perfavore ' +
     'dal Firefox Marketplace per ricevere nuove funzionalità.',
     selectCountryAlert: 'Perfavore seleziona una nazione.',
     movilNumberValidationAlert: 'Il numero del cellulare:\n' +
     '+{{prefix}} {{number}}\nnon sembra essere un numero valido del ' +
     '{{country}}.\nVuoi continuare in ogni caso?',
     registerErrorObjectAlert: 'Errore nella registrazione' +
     'il tuo numero.\n Perfavore controlla la connessione a internet.',
     registerError429Alert: 'Errore nel registrare il  numero\n' +
     ' Contattare il supporto.',
     registerErrorGenericAlert: 'Errore nel registrare il numero.' +
     ' \n Riprovare più tardi.',
     registerErrorTooRecent: 'È ancora troppo presto per richiedere un altro ' +
     'codice di registrazione.\nControlla di non aver ricevuto il messaggio di conferma con il ' +
     'codice. Se così fosse attendere un altro pò oppure riprovre fra  {{minutes}} ' +
     'minuti',
     pinInvalidAlert: 'PIN non riconosciuto. Perfavore riprova.',
     screenNameAlert: 'Perfavore inserisci il tuo nome.',
     inbox: 'In entrata',
     noConversation: 'Nessuna conversazione',
     selectContacts: 'Seleziona un contatto nella lista dei contatti di OpenWapp per' +
     'iniziare a chattare.',
     removeGroupConversation: 'Vuoi uscire dal gruppo {{groupTitle}}' +
     ' e cancellare la conversazione?',
     remove1to1Conversation: 'Sicuro di voler cancellare la conversazione ' +
     ' con {{who}}?',
     removeMessage: 'Sicuro di voler rimuovere questo messaggio?',
     today: 'Oggi',
     yesterday: 'Ieri',
     before: 'Vecchio',
     settings: 'Impostazioni',
     profile: 'Profilo',
     profileExplanation: 'Qui puoi impostare il tuo nome, stato e ' +
     'immagine del profilo:',
     openWapp: 'OpenWapp',
     loading: 'Caricamento…',
     loadingConversations: 'Caricamento conversazioni…',
     registerOpenWapp: 'OpenWapp Registrazione',
     welcomeMessage1: 'Benvenuto su OpenWapp.',
     welcomeMessage2: 'La registrazione è facile e veloce.',
     insertMobileNumber: 'Perfavore inserisci il tuo numero:.',
     countryDetectedOnLogin: 'Numero del {{country}} . ' +
     'Cambialo se non è corretto',
     countryNotDetectedOnLogin: 'Perfavore seleziona la tua nazione qui sotto',
     country: 'Nazione',
     yourNumberPlaceHolder: 'Numero cellulare',
     nextButton: 'Avanti',
     backButton: 'Indietro',
     reEnterPhone: 'Registra un altro numero',
     goToValidateButton: 'Già possiedo il codice!',
     smsValMessage: 'Grazie, proveremo a convalidare il tuo numero:',
     codePlaceholder: 'PIN',
     sendingValCode: 'Convalidazione numero…',
     loginEditIncorrect: 'Clicca per modificare il tuo numero se incorretto.',
     loginNumberOk: 'Premi OK se il numero è giusto.',
     acceptButton: 'OK',
     name: 'Tuo nome',
     settingsGeneral: 'Generale',
     settingsAbout: 'About',
     settingsVersion: 'Versione',
     logout: 'Esci',
     validateCode: 'Inserisci il PIN che hai ricevuto ' +
     'via SMS',
     validateCodeProgress: 'Verifica codice…',
     validateCodeCall: 'Chiamami per convalidare il codice',
     settingAccount: 'Impostando l account…',
     pictureDescription: 'Scegli un immagine da far visualizzare ai tuoi contatti ',
     screenNamePlaceHolder: 'Tuo nome',
     screenNameDescription: 'Questo apparirà come il tuo nome ai contatti',
     statusPlaceHolder: 'Cosa sto pensando?',
     statusDescription: 'Questo apparirà come il tuo stato ai contatti',
     doneButton: 'Fatto',
     pending: 'in attesa',
     sent: 'inviato',
     unsent: 'non inviato',
     defaultImageCaption: 'Immagine',
     received: 'ricevuto',
     composeImageCaptionPlaceholder: 'Aggiungi un immagine',
     sendButton: 'Inviato',
     loadImageError: 'L\' immagine non può essere caricata in questo momento\n Perfavore ' +
     'riprova più tardi.',
     sendingImage: 'Invio in corso',
     audioMessageSent: 'Audio inviato',
     audioMessageReceived: 'Audio ricevuto',
     loadAudioError: 'Questo file non può essere inviato al momento.\n Perfavore ' +
     'riprova più tardi.',
     sendLocation: 'Invia posizione',
     loadLocationError: 'La posizione non può essere caricata al momento\n' +
     'Perfavore riprova più tardi.',
     retrievingLocation: 'Ricavando i dati per la posizione…',
     cancelButton: 'Cancella',
     currentLocation: 'La mia posizione attuale',
     logoutAlertText: 'Utilizza questa opzione soltanto se vuoi pulire OpenWapp ' +
     'da questo dispositivo, in modo da poter entrare con OpenWapp da un altro dispositivo ' +
     'Per andare offline, ti basterà chiudere semplicemente OpenWapp' +
     'andrà in stanby automaticamente',
     savePicture: 'Salva',
     sdCardUnavailable: 'La scheda di memoria (SD) non è disponibile ',
     pictureSavePrompt: 'Vuoi salvare quest\' immagine nella galleria?',
     pictureSaveInfo: 'Salvata',
     pictureSaveError: 'Errore nel salvare l\' immagine',
     migrationHeader: 'OpenWapp aggiornato',
     migrationBody: 'OpenWapp sta terminando l\'aggiornamento',
     migrationPleaseWait: 'Perfavore attendi',
     conversationLastSeen: 'Ultimo accesso:',
     conversationIsOnline: 'Online',
     loadingParticipants: 'Caricamento contatti…',
     invite: 'Invita a  WhatsApp',
     tellAFriendText: 'Controlla Whatsapp Messenger per Android, iPhone, ' +
     'Nokia, BlackBerry, Windows Phone e adesso anche Firefox OS! Scaricalo' +
     'oggi da http://whatsapp.com/dl/',
     emojiListTitle: 'Seegli un emoji da mandare',
     contactProfile: 'Profilo del contatto',
     newGroup: 'Nuovo gruppo',
     groupProfile: 'Informazioni Gruppo',
     leaveGroup: 'Abbandona il Gruppo',
     groupPictureDescription: 'Scegli un immagine per il gruppo',
     subjectPlaceHolder: 'Questo gruppo tratta di...',
     subjectDescription: 'Brevemente descrivi di cosa tratta questo gruppo',
     participants: 'Membri',
     unknownParticipant: 'Membro sconosciuto',
     participantsDescription: 'Scegli i membri di questo gruppo',
     addParticipant: 'Aggiungi Membro',
     removeParticipant: 'Rimuovi membro',
     image: 'Immagine',
     video: 'Video',
     audio: 'Audio',
     you: 'Tu',
     notificationSubjectChanged: '{{who}} ha cambiato il titolo del gruppo ' +
     'to:\n{{subject}}',
     notificationSubjectChangedByYou: 'Hai cambiato il titolo del gruppo' +
     'to:\n{{subject}}',
     notificationGroupParticipantAdded: '{{who}} è entrato nel gruppo',
     notificationGroupParticipantRemoved: '{{who}} ha lasciato il gruppo',
     notificationGroupPictureUpdated: '{{who}} ha cambiato l\' immagine del gruppo',
     notificationGroupPictureUpdatedByYou: 'Hai cambiato l\'immagine del gruppo',
     notificationGroupPictureRemoved: '{{who}} ha rimosso l\' immagine del gruppo',
     notificationGroupPictureRemovedByYou: 'Hai rimosso l\'immagine del gruppo',
     notificationReportTitle: 'Hai {{count}} nuovi messaggi.',
     notificationReportBody: 'Da {{count}} conversazioni.',
     inAppNotification: '{{title}}: {{body}}',
     wakeUpTime: 'Controlla messaggi…',
     wakeUpDescription: 'Tempo nella quale OpenWapp controlla nuovi messaggi: meno tempo ' +
     'equivale ad un alto consumo della batteria',
     eachMinute: 'Ogni minuto',
     each5Minutes: 'Ogni 5 minuti',
     each10Minutes: 'Ogni 10 minuti',
     each20Minutes: 'Ogni 20 minuti',
     each30Minutes: 'Ogni 30 minuti',
     eachHour: 'Ogni ora',
     disabled: 'Mai',
     termsOfUse: 'Termini e condizioni',
     fileTooLargeToBeSent: 'Il file è troppo grande. Il limite per mandare i' +
     'file è 10MiB.',
     errorAddingParticipant: 'Questo contatto non può esser aggiunto al gruppo',
     genericConnectionProblem: 'Problema inaspettato. Sei ' +
     'sicuro d\' esser connesso? Prova a chiudere e aprire nuovamente OpenWapp. Se il ' +
     'problema continua, riprova più tardi.',
     participatingInTooMuchGroups: 'Stai partecipando in troppi gruppi' +
     '. Il limite è 50. Dovresti uscire in qualcuno prima di entrare ' +
     'in un altro.',
     accountExpired: 'Il tuo account è scaduto. Vorresti aggiornare ' +
     'il tuo account adesso?',
     accountExpiration: 'Data di scadenza:',
     upgradeNow: 'Aggiornalo adesso',
     notSquarePicture: 'L\'immagine selezionata non è un quadrato. Questo renderà l\' immagine ' +
     'modificata male ai lati. Se vuoi risolvere il problema, vai nella ' +
     'Galleria, ed edita la foto, usando 1:1 come scala.'
  },
    de: {
      all: 'Alle',
      contacts: 'Kontakte',
      noContacts: 'Sie haben keine Kontake',
      jan: 'Jan',
      feb: 'Febr',
      mar: 'März',
      apr: 'Apr',
      may: 'Mai',
      jun: 'Juni',
      jul: 'Juli',
      aug: 'Aug',
      sep: 'Sept',
      oct: 'Okt',
      nov: 'Nov',
      dic: 'Dez',
      offline: 'offline',
      online: 'online',
      connecting: 'Verbinde...',
      oldAppAlert: 'Diese Version wird nicht mehr unterstützt. ' +
        'Bitte installieren Sie das Update im Firefox Marketplace, ' +
        'um die neuesten Funktionen zu genießen.',
      selectCountryAlert: 'Bitte wählen Sie ein Land aus.',
      movilNumberValidationAlert: 'Die Rufnummer:\n' +
        '+{{prefix}} {{number}}\nscheint keine gültige Mobilfunknummer aus ' +
        '{{country}} zu sein.\nWollen Sie trotzdem fortfahren?',
      registerErrorObjectAlert: 'Beim Registrieren Ihrer Nummer ist ein ' +
      'Fehler aufgetreten.\nBitte überprüfen Sie Ihre ' +
      'Verbindungseinstellungen.',
      registerError429Alert: 'Beim Registrieren Ihrer Nummer ist ein Fehler ' +
      'aufgetreten.\nBitte kontaktieren Sie den technischen Support.',
      registerErrorGenericAlert: 'Beim Registrieren Ihrer Nummer ist ein ' +
      'Fehler aufgetreten.\nBitte versuchen Sie es später noch einmal.',
      registerErrorTooRecent: 'Die erneute Anforderung eines ' +
      'Registrierungscodes ist noch nicht möglich. Bitte überprüfen Sie, ob ' +
      'Sie die Bestätigungsnachricht empfangen haben. Ansonsten können Sie ' +
      'in {{minutes}} einen neuen Code anfordern.',
      pinInvalidAlert: 'PIN nicht erkannt. Bitte versuchen Sie es noch einmal.',
      screenNameAlert: 'Bitte geben Sie Ihren Namen ein.',
      inbox: 'Eingang',
      noConversation: 'Keine Konversationen.',
      selectContacts: 'Wählen Sie einen Kontakt aus, um eine Nachricht zu ' +
      'schreiben.',
      removeGroupConversation: 'Wollen Sie die Gruppe {{groupTitle}} ' +
      'verlassen und die Konversation löschen?',
      remove1to1Conversation: 'Wollen Sie die Konversation mit {{who}} ' +
      'löschen?',
      removeMessage: 'Wollen Sie diese Nachricht löschen?',
      today: 'Heute',
      yesterday: 'Gestern',
      before: 'Älter',
      settings: 'Einstellungen',
      profile: 'Profil',
      profileExplanation: 'Hier können Sie ihren Kontaktnamen, Status und ' +
      'Kontaktbild einstellen.',
      openWapp: 'OpenWapp',
      loading: 'Lade...',
      laodingConversations: 'Lade Konversationen...',
      registerOpenWapp: 'OpenWapp Registrierung',
      welcomeMessage1: 'Willkommen bei OpenWapp.',
      welcomeMessage2: 'Die Registrierung ist schnell und einfach.',
      insertMobileNumber: 'Bitte geben Sie Ihre Mobilfunknummer ein',
      countryDetectedOnLogin: 'Sie scheinen eine Mobilfunknummer aus ' +
      'Österreich zu haben. Ändern Sie dies andernfalls.',
      countryNotDetectedOnLogin: 'Bitte wählen Sie unterhalb ihr Land aus.',
      country: 'Land',
      yourNumberPlaceHolder: 'Mobilfunknummer',
      nextButton: 'Weiter',
      backButton: 'Zurück',
      reEnterPhone: 'Registrieren Sie ein anderes Telefon',
      goToValidateButton: 'Ich kenne meinen Code bereits!',
      smsValMessage: 'Danke, Ihre Nummer wird jetzt überprüft:',
      codePlaceholder: 'Code',
      sendingValCode: 'Nummer wird überprüft...',
      loginEditIncorrect: 'Antippen, um die Nummer zu korrigieren.',
      loginNumberOk: 'Drücken Sie OK, falls Ihre Nummer korrekt ist.',
      acceptButton: 'OK',
      name: 'Ihr Name',
      settingGeneral: 'Allgemein',
      settingsAbout: 'Über',
      settingsVersion: 'Version',
      logout: 'Ausloggen',
      validateCode: 'Bitte geben Sie den per SMS empfangenen Code ein.',
      validateCodeProgress: 'Überprüfe Code...',
      validateCodeCall: 'Anruf anfordern',
      settingAccount: 'Erstelle Benutzerkonto...',
      pictureDescription: 'Wählen Sie Ihr Kontaktbild aus',
      screenNamePlaceHolder: 'Ihr Name',
      screenNameDescription: 'Wird bei anderen als Ihr Name angezeigt.',
      statusPlaceHolder: 'Ich fühle mich...',
      statusDescription: 'Wird bei anderen als Ihr Status angezeigt.',
      doneButton: 'Fertig',
      pending: 'ausstehend',
      sent: 'gesendet',
      unsent: 'nicht gesendet',
      defaultImageCaption: 'Bild',
      received: 'Empfangen',
      composeImageCaptionPlaceholder: 'Füge einen Titel hinzu',
      sendButton: 'Senden',
      loadImageError: 'Das Bild kann im Moment nicht geladen werden.\n' +
        'Bitte versuchen Sie es später noch einmal.',
      sendingImage: 'Sende...',
      audioMessageSent: 'Audio gesendet',
      audioMessageReceived: 'Audio empfangen',
      loadAudioError: 'Die Datei kann im Moment nicht geladen werden.\n' +
        'Bitte versuchen Sie es später noch einmal.',
      retrievingLocation: 'Frage Standort ab...',
      cancelButton: 'Abbrechen',
      currentLocation: 'Mein derzeitiger Standort',
      logoutAlertText: 'Nutzen Sie diese Option nur, falls Sie OpenWapp ' +
      'zurücksetzen wollen, um sich auf einem anderen Gerät einloggen ' +
      'zu können. Um sich abzumelden, schließen Sie OpenWapp einfach.',
      savePicture: 'Speichern',
      sdCardUnavailable: 'Speicherkarte ist nicht verfügbar',
      pictureSavePrompt: 'Wollen Sie dieses Foto in die Galerie speichern?',
      pictureSaveInfo: 'Gespeichert',
      pictureSaveError: 'Beim Speichern des Fotos ist ein Fehler aufgetreten.',
      migrationHeader: 'OpenWapp Update',
      migrationBody: 'OpenWapp aktualisiert sich zur neuesten Version.',
      migrationPleaseWait: 'Bitte warten',
      conversationLastSeen: 'Zuletzt gesehen:',
      conversationIsOnline: 'Online',
      loadingParticipants: 'Lade Kontakte…',
      invite: 'Zu WhatsApp einladen',
      tellAFriendText: 'Entdecke WhatsApp für BlackBerry, Android, iPhone, ' +
      'Nokia und Windows Phone. Lade es noch heute von ' +
      'http://whatsapp.com/dl/ herunter.',
      emojiListTitle: 'Wähle ein Emoji zum Senden aus',
      contactProfile: 'Kontaktfoto',
      newGroup: 'Neue Gruppe',
      groupProfile: 'Gruppeninformation',
      leaveGroup: 'Gruppe verlassen',
      groupPictureDescription: 'Wählen Sie ein Bild für die Gruppe aus',
      subjectPlaceHolder: 'In dieser Gruppe geht es um...',
      subjectDescription: 'Beschreiben Sie kurz das Thema der Gruppe',
      participants: 'Mitglieder',
      unknownParticipant: 'Unbekanntes Mitglied',
      participantsDescription: 'Wählen Sie die Mitglieder aus',
      addParticipant: 'Mitglied hinzufügen',
      removeParticipant: 'Mitglied aus der Gruppe löschen',
      image: 'Bild',
      video: 'Video',
      audio: 'Audio',
      you: 'Sie',
      notificationSubjectChanged: '{{who}} hat das Thema der Gruppe ' +
      'zu:\n{{subject}}\ngeändert.',
      notificationSubjectChangedByYou: 'Sie haben das Thema der Gruppe ' +
      'zu:\n{{subject}}\ngeändert.',
      notificationGroupParticipantAdded: '{{who}} ist der Gruppe beigetreten',
      notificationGroupParticipantRemoved: '{{who}} ist aus der Gruppe ' +
      'ausgetreten',
      notificationGroupPictureUpdated: '{{who}} hat das Gruppenbild geändert',
      notificationGroupPictureUpdatedByYou: 'Sie haben das Gruppenbild ' +
      'geändert',
      notificationGroupPictureRemoved: '{{who}} hat das Gruppenbild entfernt',
      notificationGroupPictureRemovedByYou: 'Sie haben das Gruppenbild ' +
      'entfernt',
      notificationReportTitle: 'Sie haben {{count}} neue Nachrichten',
      notificationReportBody: 'in {{count}} Konversationen',
      inAppNotification: '{{title}} {{body}}',
      wakeUpTime: 'Empfange neue Nachrichten…',
      wakeUpDescription: 'Synchronisierungsintervall: kürzere Intervalle ' +
      'führen zu höherem Energieverbrauch.',
      eachMinute: 'Jede Minute',
      each5Minutes: 'Alle 5 Minuten',
      each10Minutes: 'Alle 10 Minuten',
      each20Minutes: 'Alle 20 Minuten',
      each30Minutes: 'Alle 30 Minuten',
      eachHour: 'Jede Stunde',
      disabled: 'Nie',
      termsOfUse: 'Allgemeine Geschäftsbedingungen',
      fileTooLargeToBeSent: 'Die Datei ist zu groß. Die maximale Dateigröße ' +
        'beträgt 10MiB.',
      errorAddingParticipant: 'Dieser Kontakt kann nicht zu dieser Gruppe ' +
      'hinzugefügt werden',
      genericConnectionProblem: 'Ein unerwarteter Fehler ist aufgetreten. ' +
      'Sind Sie sicher, dass sie mit dem Internet verbunden sind? Versuchen ' +
      'Sie, OpenWapp zu schließen und neu zu starten. Falls das Problem ' +
      'erneut auftritt, versuchen Sie es später noch einmal.',
      participatingInTooMuchGroups: 'Sie sind in zu vielen Gruppen Mitglied. ' +
        'Sie können maximal in 50 Gruppen sein. Um einer Gruppe ' +
      'beizutreten, müssen Sie zuerst aus einer Gruppe austreten.',
      accountExpired: 'Ihr Benutzerkonto ist abgelaufen. Wollen Sie Ihr ' +
      'Benutzerkonto jetzt erneuern?',
      accountExpiration: 'Ablaufdatum',
      upgradeNow: 'Jetzt erneuern',
      notSquarePicture: 'Das ausgewählte Bild ist nicht quadratisch, daher ' +
      'wird ein Balken hinzugefügt. Um dies zu ändern, gehen Sie in die ' +
      'Gallerie und schneiden Sie das Foto zu.'
    }
  };
});
