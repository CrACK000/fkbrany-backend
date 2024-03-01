import Joi from 'joi';

export const validate = {

  entryGate: Joi.boolean(),

  montage: Joi.boolean(),

  motor: Joi.boolean(),

  fenceParts: Joi.boolean(),

  name: Joi.string().min(3).max(30).messages({

    'string.min': 'Meno musí obsahovať minimálne 3 znaky.',
    'string.max': 'Meno je príliš dlhé.',
    'string.empty': 'Vyplňte meno.',

  }),

  surname: Joi.string().optional().max(40).messages({

    'string.empty': 'Vyplňte priezvisko.',
    'string.max': 'Priezvisko je príliš dlhé.',

  }),

  email: Joi.string().email().messages({

    'string.email': 'Nesprávny formát emailu.',

  }),

  mobile: Joi.string().pattern(new RegExp(`^[+]\+?[1-9][0-9]{11,15}$`)).allow('').messages({

    'string.pattern.base': 'Nesprávny formát tel. čísla.',

  }),

  gate: Joi.string().optional().messages({

    'string.empty': 'Vyberte typ brány.',

  }),

  styleGate: Joi.string().optional().messages({

    'string.empty': 'Vyberte vzor brány.',

  }),

  widthGate: Joi.string().optional().messages({

    'string.empty': 'Zadajte šírku otvoru pre bránu.',

  }),

  heightGate: Joi.string().optional().messages({

    'string.empty': 'Zadajte výšku otvoru pre bránu.',

  }),

  widthEntryGate: Joi.when('entryGate', { is: true, then: Joi.string().required(), otherwise: Joi.optional() }).messages({

    'string.empty': 'Zadajte šírku otvoru pre vstupnú bránku.',

  }),

  heightEntryGate: Joi.when('entryGate', { is: true, then: Joi.string().required(), otherwise: Joi.optional() }).messages({

    'string.empty': 'Zadajte výšku otvoru pre vstupnú bránku.',

  }),

  montagePlace: Joi.when('montage', { is: true, then: Joi.string().required(), otherwise: Joi.optional() }).messages({

    'string.empty': 'Zadajte lokalitu montáže.',

  }),

  msg: Joi.string().optional().messages({

    'string.empty': 'Napíšte nám správu.',

  }),

  fencePartsList: Joi.when('fenceParts', { is: true, then: Joi.array().min(1), otherwise: Joi.optional() }).messages({

    'array.min': 'Pridajte plotové dielce.'

  }),

}