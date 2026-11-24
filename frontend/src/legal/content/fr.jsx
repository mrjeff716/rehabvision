// =============================================================================
// Texte français des politiques. Doit dire exactement la même chose que en.jsx.
// Traduction à faire relire par un locuteur natif ou un juriste.
// =============================================================================

import { Link } from 'react-router'
import { BUSINESS as B, PLANS, POLICY as P, mailto } from '../business'

const planLabel = (plan, i) =>
  plan.maxPatients ? `Jusqu’à ${plan.maxPatients} patients` : `Plus de ${PLANS[i - 1].maxPatients} patients`

export default {
  privacy: {
    title: 'Politique de confidentialité',
    Body: () => (
      <>
        <p>
          Cette politique explique quelles données personnelles {B.name} (« nous »), basé au Liban, collecte,
          pourquoi, qui peut les voir et quels sont vos choix. Pour toute question ou demande, écrivez
          à {mailto(B.privacyEmail)}.
        </p>

        <h2>Ce que nous collectons</h2>
        <ul>
          <li><b>Votre compte :</b> nom, adresse e-mail, si vous êtes patient ou physiothérapeute, et votre mot de passe. Nous ne conservons le mot de passe que sous forme de hachage irréversible, jamais le mot de passe lui-même.</li>
          <li><b>Réinitialisation du mot de passe :</b> si vous utilisez « Mot de passe oublié », nous vous envoyons par e-mail un lien à usage unique. Nous ne conservons qu’une version brouillée (hachée) de son code, et le lien expire après 30 minutes.</li>
          <li><b>Kinésithérapeutes :</b> un identifiant public (comme PT-ABC234) que nous créons pour que les patients puissent vous trouver.</li>
          <li><b>Patients :</b> le physiothérapeute auquel vous êtes lié, et les exercices qu’il vous attribue : exercice, côté, angles, amplitude sûre, nombre de répétitions, quand s’arrêter, et sa confirmation que vous êtes apte à faire l’exercice.</li>
          <li><b>Résultats des exercices :</b> pour chaque séance, l’exercice et le côté, le programme à ce moment-là, l’angle maximal atteint à chaque répétition et si l’objectif a été atteint, le nombre de répétitions, un score de douleur facultatif, ainsi que la date et l’heure.</li>
          <li><b>Données techniques :</b> votre adresse IP est gardée brièvement dans la mémoire du serveur pour limiter le nombre de requêtes par connexion. Elle n’est pas enregistrée dans notre base de données. Nos hébergeurs peuvent conserver leurs propres journaux.</li>
          <li><b>Facturation (physiothérapeutes et établissements uniquement) :</b> les informations nécessaires pour vous facturer et enregistrer vos paiements. Les paiements nous sont faits directement, en dehors de l’application ; nous ne voyons ni ne stockons jamais de numéro de carte dans l’application.</li>
        </ul>
        <p>Les programmes d’exercices et les résultats sont des <b>données de santé</b>. Nous les utilisons uniquement pour faire fonctionner le service pour vous et votre physiothérapeute.</p>

        <h2>Ce que nous ne collectons pas</h2>
        <ul>
          <li><b>Aucune vidéo ni photo.</b> L’image de la caméra est analysée sur votre propre appareil pour mesurer l’angle de votre articulation. Elle n’est jamais envoyée ni enregistrée. Seuls les chiffres ci-dessus sont envoyés.</li>
          <li><b>Aucun pistage.</b> {B.name} n’utilise aucun outil d’analyse, de publicité ou de réseaux sociaux, et ne dépose aucun cookie. Voir <Link to="/cookies">Cookies et stockage</Link>.</li>
          <li>Nous ne vendons pas vos données et ne les utilisons pas à des fins publicitaires.</li>
        </ul>

        <h2>Qui peut voir vos données</h2>
        <ul>
          <li><b>Votre physiothérapeute</b>, une fois que vous êtes lié à lui : votre nom, votre adresse e-mail, les exercices attribués, vos 50 résultats les plus récents (y compris ceux antérieurs à votre lien avec lui), et un résumé hebdomadaire « à surveiller » basé sur ces résultats. Si vous retirez votre physiothérapeute, il ne peut plus voir aucune de vos données dans {B.name}, et vos exercices attribués sont supprimés.</li>
          <li><b>Les patients</b> qui saisissent l’identifiant public d’un physiothérapeute voient son nom et son identifiant.</li>
          <li><b>Les prestataires</b> qui font fonctionner le service pour nous : Netlify (héberge le site), Render (fait fonctionner notre serveur), notre base de données MongoDB privée et notre fournisseur d’e-mail (envoie les e-mails de réinitialisation du mot de passe). Ils ne peuvent utiliser les données que pour nous fournir leur service.</li>
          <li>Les autorités, uniquement lorsque la loi nous y oblige.</li>
        </ul>

        <h2>Pourquoi nous les utilisons (base légale)</h2>
        <ul>
          <li>Compte et facturation : pour fournir le service auquel vous vous êtes inscrit.</li>
          <li>Données de santé (programmes et résultats) : avec votre consentement explicite, donné lors de la création d’un compte patient. Vous pouvez le retirer à tout moment en retirant votre physiothérapeute ou en nous demandant de supprimer votre compte. Le retrait ne remet pas en cause l’utilisation antérieure.</li>
          <li>Adresse IP pour la limitation des requêtes : pour garder le service sûr et disponible.</li>
        </ul>
        <p>Nous respectons la loi libanaise n° 81 de 2018 relative aux transactions électroniques et aux données personnelles et, pour les utilisateurs dans l’Union européenne, le Règlement général sur la protection des données (RGPD).</p>

        <h2>Où vos données sont stockées</h2>
        <p>Nos serveurs et notre base de données peuvent se trouver hors de votre pays. Lorsque la loi l’exige, nous mettons en place des garanties appropriées pour ces transferts.</p>

        <h2>Retour vocal</h2>
        <p>Le coach prononce de courtes phrases (comme « Bien ») grâce à la synthèse vocale intégrée à votre navigateur. Certains navigateurs utilisent pour cela un service vocal en ligne de leur éditeur. Ces phrases sont les mêmes pour tous et ne contiennent aucune donnée personnelle.</p>

        <h2>Durée de conservation</h2>
        <p>Nous conservons votre compte et vos résultats tant que votre compte est ouvert. Lorsque vous nous demandez de supprimer votre compte, nous le supprimons avec ses résultats dans un délai de {P.deletionDays} jours, sauf les documents que la loi nous oblige à garder (comme les factures).</p>

        <h2>Vos droits</h2>
        <p>Vous pouvez demander à consulter les données que nous détenons sur vous, à les corriger, à les supprimer, à en recevoir une copie, ou à vous opposer à leur utilisation ou à la limiter. Pour toute demande, y compris la fermeture de votre compte, écrivez à {mailto(B.privacyEmail)}. Nous répondons dans un délai de {P.deletionDays} jours. Si vous n’êtes pas satisfait, vous pouvez saisir l’autorité de protection des données de votre lieu de résidence.</p>

        <h2>Sécurité</h2>
        <p>Les mots de passe ne sont conservés que sous forme de hachage. Dans l’application, il faut se connecter pour voir des données personnelles, et les données d’un patient ne sont visibles que par ce patient et son physiothérapeute lié. Notre équipe et nos prestataires n’accèdent aux données que lorsque c’est nécessaire pour faire fonctionner ou réparer le service. Aucun système n’est totalement sûr ; si une violation vous concerne, nous vous en informerons comme la loi l’exige.</p>

        <h2>Enfants</h2>
        <p>Les patients de moins de {P.adultAge} ans ne peuvent utiliser {B.name} que sous la surveillance d’un parent ou tuteur, qui crée et gère le compte et donne les consentements au nom de l’enfant.</p>

        <h2>Modifications</h2>
        <p>Nous mettrons cette page à jour lorsque les données collectées changeront, et modifierons la date en haut de page.</p>
      </>
    ),
  },

  terms: {
    title: 'Conditions d’utilisation',
    Body: () => (
      <>
        <p>
          Ces conditions s’appliquent à l’utilisation de {B.name}, basé au Liban. En créant un compte, vous les acceptez,
          ainsi que la <Link to="/privacy">Politique de confidentialité</Link> et, pour les physiothérapeutes et
          établissements, la <Link to="/pricing">Politique de tarifs, résiliation et remboursement</Link>.
        </p>

        <h2>Ce qu’est {B.name}</h2>
        <p>Un outil qui permet à un physiothérapeute d’attribuer des exercices à domicile et au patient de les faire devant une caméra, avec un retour visuel et vocal sur l’angle de l’articulation et les répétitions.</p>

        <h2>Pas un avis médical, pas pour les urgences</h2>
        <ul>
          <li>{B.name} ne pose aucun diagnostic, ne traite aucune affection et ne remplace pas votre physiothérapeute ou votre médecin.</li>
          <li>Les angles mesurés par la caméra sont des estimations. Ils peuvent être faux à cause de l’éclairage, de la position de la caméra, des vêtements ou de la partie du corps visible.</li>
          <li>Suivez les instructions de votre physiothérapeute. Arrêtez et demandez conseil si vous ressentez une douleur ou de nouveaux symptômes, ou si votre programme indique de vous arrêter.</li>
          <li>En cas d’urgence, appelez le numéro d’urgence local.</li>
        </ul>

        <h2>Votre compte</h2>
        <ul>
          <li>Donnez des informations exactes et gardez votre mot de passe secret. Un compte est destiné à une seule personne.</li>
          <li>Les patients de moins de {P.adultAge} ans ne peuvent utiliser {B.name} que sous la surveillance d’un parent ou tuteur, responsable du compte.</li>
        </ul>

        <h2>Kinésithérapeutes et établissements</h2>
        <ul>
          <li>Vous devez être qualifié et autorisé à exercer là où vous soignez vos patients.</li>
          <li>Vous êtes responsable des exercices, angles, amplitudes sûres et critères d’arrêt que vous attribuez, et de confirmer que chaque patient est apte à les faire.</li>
          <li>Utilisez les données des patients uniquement pour les soigner, en respectant les règles professionnelles et de protection des données de santé qui vous concernent.</li>
          <li>Les abonnements, la résiliation et les remboursements sont régis par la <Link to="/pricing">Politique de tarifs, résiliation et remboursement</Link>.</li>
        </ul>

        <h2>Prix</h2>
        <p>{B.name} est gratuit pour les patients. Les physiothérapeutes, ou l’établissement où ils travaillent, paient un abonnement mensuel. Aucun paiement n’est effectué dans l’application ; ils sont réglés directement avec {B.name}.</p>

        <h2>Utilisation acceptable</h2>
        <p>N’utilisez pas le service de manière abusive : pas d’accès aux comptes ou données d’autrui, pas de tentative de le casser ou de le surcharger, rien d’illégal.</p>

        <h2>Disponibilité et modifications</h2>
        <p>Nous faisons en sorte que {B.name} fonctionne, mais ne pouvons pas garantir qu’il sera toujours disponible ou sans erreur. Nous pouvons modifier ou arrêter des fonctionnalités, et mettrons ces conditions à jour en conséquence.</p>

        <h2>Responsabilité</h2>
        <p>Nous ne sommes pas responsables des pertes causées par l’utilisation d’exercices ou de mesures contre l’avis de votre physiothérapeute, ou par des événements hors de notre contrôle. Rien dans ces conditions ne limite une responsabilité que la loi ne permet pas de limiter, ni vos droits de consommateur.</p>

        <h2>Fin de l’utilisation</h2>
        <p>Vous pouvez cesser d’utiliser {B.name} à tout moment et nous demander de supprimer votre compte ({mailto(B.privacyEmail)}). Nous pouvons suspendre un compte qui enfreint ces conditions.</p>

        <h2>Droit applicable et contact</h2>
        <p>Ces conditions sont régies par le droit libanais, et les litiges relèvent des tribunaux libanais compétents, sans préjudice des droits que vous tenez de la loi de votre pays de résidence. Questions : {mailto(B.email)}.</p>
      </>
    ),
  },

  pricing: {
    title: 'Tarifs, résiliation et remboursements',
    Body: () => (
      <>
        <p>{B.name} est <b>gratuit pour les patients</b>. Les physiothérapeutes, ou l’établissement où ils travaillent, paient un abonnement mensuel par physiothérapeute. Aucun paiement n’est effectué dans l’application ; nous vous envoyons une facture et vous payez {B.name} directement.</p>

        <h2>Tarifs</h2>
        <table className="data-table">
          <thead><tr><th>Patients liés en même temps</th><th>Prix par physiothérapeute</th></tr></thead>
          <tbody>
            {PLANS.map((plan, i) => (
              <tr key={plan.price}><td>{planLabel(plan, i)}</td><td>{plan.price} $ par mois</td></tr>
            ))}
          </tbody>
        </table>
        <p>Les prix sont en dollars américains. Chaque partie paie ses propres frais bancaires ou de transfert. Si une taxe s’applique, elle figure sur la facture. Un établissement paie le même prix pour chacun de ses physiothérapeutes, sauf accord écrit contraire.</p>

        <h2>Facturation</h2>
        <ul>
          <li>Vous êtes facturé chaque mois, d’avance, à partir du jour où votre abonnement commence.</li>
          <li>Votre formule dépend du nombre de patients liés à vous en même temps. Si vous dépassez la limite de votre formule, nous vous demanderons de passer à la formule suivante à partir du mois de facturation suivant. Nous ne facturons jamais les mois passés.</li>
          <li>Le passage à une formule supérieure prend effet immédiatement ; le nouveau prix s’applique à partir du mois de facturation suivant. Le passage à une formule inférieure prend effet au mois de facturation suivant, à condition que vos patients y tiennent.</li>
        </ul>

        <h2>Résiliation</h2>
        <ul>
          <li>Vous pouvez résilier à tout moment en écrivant à {mailto(B.email)}. Il n’y a ni durée minimale ni frais de résiliation.</li>
          <li>La résiliation prend effet à la fin du mois déjà payé. Vous gardez un accès complet jusque-là et n’êtes plus facturé.</li>
          <li>Ensuite, nous pouvons limiter votre compte : vous ne pourrez plus lier de nouveaux patients ni attribuer d’exercices jusqu’à un nouvel abonnement. Vos patients gardent leur compte gratuit et leurs propres résultats.</li>
        </ul>

        <h2>Remboursements</h2>
        <ul>
          <li><b>Garantie du premier paiement :</b> si vous êtes nouveau sur {B.name}, vous pouvez obtenir le remboursement intégral de votre premier paiement en le demandant dans les {P.moneyBackDays} jours suivant ce paiement.</li>
          <li><b>Toujours remboursés :</b> les paiements en double, les erreurs de facturation et tout prélèvement fait après la prise d’effet de votre résiliation.</li>
          <li><b>Longues interruptions :</b> si {B.name} est indisponible plus de {P.outageHours} heures d’affilée à cause d’un problème de notre côté, nous remboursons ou créditons ces jours au prorata, sur demande.</li>
          <li><b>Si nous arrêtons le service</b> ou fermons votre compte sans que vous ayez enfreint les <Link to="/terms">Conditions</Link>, nous remboursons la partie non utilisée du mois payé.</li>
          <li>Sinon, les mois commencés ne sont pas remboursés, y compris en cas de résiliation en cours de mois.</li>
          <li>Les comptes fermés pour non-respect des Conditions ne sont pas remboursés pour le mois en cours.</li>
        </ul>

        <h2>Demander un remboursement</h2>
        <p>Écrivez à {mailto(B.email)} dans les {P.refundRequestDays} jours suivant le paiement, en indiquant votre nom et la date du paiement. Nous répondons sous {P.refundReplyDays} jours ouvrables et versons les remboursements acceptés sous {P.refundPayDays} jours, si possible par le même moyen de paiement.</p>

        <h2>Retard de paiement</h2>
        <p>Si une facture n’est pas payée dans les {P.latePaymentDays} jours suivant son échéance, nous pouvons limiter votre compte à la consultation jusqu’au paiement. Nous ne supprimons jamais les données des patients à cause d’un retard de paiement.</p>

        <h2>Changements de prix</h2>
        <p>Nous vous écrirons au moins {P.priceNoticeDays} jours avant tout changement de prix. Le nouveau prix s’applique à partir du premier mois de facturation suivant l’avis, et vous pouvez résilier avant.</p>

        <h2>Vos droits</h2>
        <p>Rien dans cette politique ne limite les droits que vous tenez des lois de protection des consommateurs qui vous sont applicables.</p>
      </>
    ),
  },

  cookies: {
    title: 'Cookies et stockage',
    Body: () => (
      <>
        <p>{B.name} ne dépose <b>aucun cookie</b> et n’utilise aucun outil d’analyse, de publicité ou de pistage tiers. Il enregistre quelques éléments dans le stockage local de votre navigateur, uniquement pour que les fonctions que vous utilisez marchent :</p>
        <table className="data-table">
          <thead><tr><th>Élément</th><th>À quoi il sert</th><th>Quand il est supprimé</th></tr></thead>
          <tbody>
            <tr><td><code>authToken</code></td><td>Vous garde connecté</td><td>À la déconnexion, ou quand la connexion expire</td></tr>
            <tr><td><code>pendingSessions</code></td><td>Résultats enregistrés hors ligne, pour les envoyer plus tard</td><td>Dès qu’ils sont envoyés</td></tr>
            <tr><td><code>appLanguage</code></td><td>La langue choisie pour l’application</td><td>Quand vous effacez les données du navigateur</td></tr>
            <tr><td><code>coachLanguage</code></td><td>La langue du coach que vous avez choisie</td><td>Quand vous effacez les données du navigateur</td></tr>
            <tr><td><code>storageNoticeSeen</code></td><td>Retient que vous avez fermé l’avis sur le stockage</td><td>Quand vous effacez les données du navigateur</td></tr>
          </tbody>
        </table>
        <p>Ces éléments sont strictement nécessaires au service que vous avez demandé ; nous ne demandons donc pas votre consentement. Si nous ajoutons un jour des cookies facultatifs ou un outil d’analyse, nous vous demanderons d’abord votre consentement et vous pourrez refuser.</p>
        <p>Vous pouvez supprimer ces éléments à tout moment dans les réglages de votre navigateur (pour ce site : effacer les données du site). Vous serez alors déconnecté, et les résultats non encore envoyés seront perdus.</p>
      </>
    ),
  },

  accessibility: {
    title: 'Accessibilité',
    Body: () => (
      <>
        <p>Nous voulons que tout le monde, y compris les personnes qui ont mal, les personnes âgées et les personnes en situation de handicap, puisse utiliser {B.name}. Nous visons le niveau AA des Règles pour l’accessibilité des contenus Web (WCAG) 2.2.</p>
        <h2>Ce que nous avons fait</h2>
        <ul>
          <li>Texte de grande taille par défaut (18 px), couleurs très contrastées et boutons d’au moins 44 pixels de haut.</li>
          <li>Tout est utilisable au clavier, avec un contour de focus bien visible.</li>
          <li>Les champs ont des libellés visibles, et les erreurs sont expliquées par des mots, pas seulement par la couleur.</li>
          <li>Le coach énonce ses retours à voix haute : pas besoin de regarder l’écran.</li>
          <li>Les animations sont réduites si votre appareil est réglé pour limiter les mouvements.</li>
          <li>L’application et ces politiques sont disponibles en anglais, français et arabe (de droite à gauche), et le coach parle plusieurs autres langues.</li>
        </ul>
        <h2>Limites connues</h2>
        <ul>
          <li>Le coach a besoin d’une caméra et qu’une partie suffisante de votre corps soit visible pour mesurer les angles.</li>
          <li>Les instructions détaillées des exercices (« Comment faire ») et certains messages du serveur sont uniquement en anglais.</li>
          <li>Le site n’a pas encore été audité par un expert indépendant en accessibilité.</li>
        </ul>
        <h2>Signaler un problème</h2>
        <p>Si quelque chose est difficile à utiliser, écrivez à {mailto(B.email)} en précisant la page et ce qui s’est passé. Nous vous répondrons et travaillerons à une correction.</p>
      </>
    ),
  },
}
