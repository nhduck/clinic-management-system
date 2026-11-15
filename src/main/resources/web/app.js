function R() {
  var V2 = {
    home: homeV,
    rec: recV,
    det: detV,
    'new': newV,
    rxn: rxnV,
    rxl: rxlV,
    rxv: rxvV,
    drugs: drugV,
    patients: patientV,
    appointments: appointmentV,
    doctors: doctorV,
    specialties: specialtyV,
    accounts: accountsV
  };
  $('app').innerHTML = S.me ? shell(V2[S.v]()) : authV();
}

R();
