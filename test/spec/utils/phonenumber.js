define([
  'utils/phonenumber'
], function (PhoneNumber) {
  'use strict';

  describe('utils/phonenumber tests', function () {

    describe('generic tests', function () {
      it('should accept a locale in the parse() method', function () {
        var phone = PhoneNumber.parse('07812345678', 'GB');
        expect(phone.full).to.equal('447812345678');

        phone = PhoneNumber.parse('677030303', 'ES');
        expect(phone.full).to.equal('34677030303');
      });

      it('should return null if the phone number is invalid', function () {
        var phone = PhoneNumber.parse('0781234567899', 'GB');
        expect(phone).to.equal(null);

        PhoneNumber.setBaseNumber('34677030303');
        phone = PhoneNumber.parse('07812345678');
        expect(phone).to.equal(null);
      });

      it('should validate correctly an international number', function () {
        expect(PhoneNumber.validate('447801104768', 'GB')).to
               .equal(true);
        expect(PhoneNumber.validate('44780110476', 'GB')).to
               .equal(false);

        expect(PhoneNumber.validate('15417543010', 'US')).to
               .equal(true);
        expect(PhoneNumber.validate('154175430100', 'US')).to
               .equal(false);

      });

      it('should validate correctly a local number', function () {
        expect(PhoneNumber.validate('07801104768', 'GB')).to
               .equal(true);
        expect(PhoneNumber.validate('0780110476', 'GB')).to
               .equal(false);
        expect(PhoneNumber.validate('5417543010', 'US')).to
               .equal(true);
        expect(PhoneNumber.validate('54175430100', 'US')).to
               .equal(false);
      });

      it('should throw an error when setting a wrong baseNumber', function () {
        expect(function () {
          PhoneNumber.setBaseNumber('44780110476');
        }).throws(/number not valid/);
      });

      it('should not take into account baseNumber when passing the locale',
        function () {

        PhoneNumber.setBaseNumber('447803860386');

        expect(PhoneNumber.parse('677010101', 'ES').full)
          .to.equal('34677010101');
      });

      it('should format correctly a valid number', function () {

        expect(PhoneNumber.format('34666010203'))
          .to.equal('+34 666 01 02 03');
      });

      it('should throw an error when formatting wrong number', function () {

        expect(function () {
          PhoneNumber.format('44780110476');
        }).throws(/number not valid/);
      });


      it('should not parse() invalid phone numbers when passing the locale',
        function () {
        expect(PhoneNumber.parse('87654321', 'BR')).to.equal(null);
      });
    });

    describe('Normalization', function () {
      var checkRules = function (origin, country, rules) {

        describe('Origin: ' + country + ' (' + origin + ')', function () {
          rules.forEach(function (rule) {
            var input = rule[0];
            var output = rule[1];

            it('Input "' + rule[0] + '" should output "' + rule[1] + '"',
              function () {
              PhoneNumber.setBaseNumber(origin);
              var phone = PhoneNumber.parse(input);
              expect(phone.full).to.equal(output);
            });
          });
        });
      };

      checkRules('447801110476', 'UK', [
        ['07803860497', '447803860497'],
        ['447801110476', '447801110476']
      ]);

      checkRules('34666666666', 'Spain', [
        ['666666666', '34666666666'],
        ['34666666666', '34666666666'],
        ['917654321', '34917654321'],
        ['+5216241431234', '526241431234']
      ]);

      checkRules('12137427326', 'United States', [
        ['2137427326', '12137427326'],
        ['12137427326', '12137427326'],
        ['+12137427326', '12137427326']
      ]);

      checkRules('551192345678', 'Brazil', [
        ['0 15 11 87654321', '551187654321'],
        ['0 15 11 8765-4321', '551187654321'],
        ['87654321', '551187654321'],
        ['0 15 11 87654321', '551187654321'],
        ['0 15 11 8765-4321', '551187654321'],
        ['87654321', '551187654321'],
        ['+5216241431234', '526241431234']
      ]);

      checkRules('573151234567', 'Colombia', [
        ['315 7654321', '573157654321'],
        ['03 315 7654321', '573157654321'],
        ['573157654321', '573157654321'],
        ['12234567', '5712234567'],          // Thanks to patched libphonenumber
        ['03 1 2234567', '5712234567']
      ]);
      checkRules('5712234567', 'Colombia', [
        ['5712234567', '5712234567'],        // Thanks to patched libphonenumber
        ['12234567', '5712234567'],
        ['3001234567', '573001234567'],
        ['03 1 2234567', '5712234567'],
        ['03 2234567', '5712234567'],
        ['+5216241431234', '526241431234']
      ]);

      checkRules('5691234567', 'Chile', [
        ['0997654321', '56997654321'],       // Thanks to patched libphonenumber
        ['97654321', '56997654321'],         // Thanks to patched libphonenumber
        ['637654321', '56637654321']
      ]);
      checkRules('56221234567', 'Chile', [
        ['27654321', '56227654321'],
        ['0997654321', '56997654321'],       // Thanks to patched libphonenumber
        ['+5216241431234', '526241431234']
      ]);

      checkRules('51912345678', 'Peru', [
        ['987654321', '51987654321'],
        ['1 1234567', '5111234567'],
        ['+5216241431234', '526241431234']
      ]);

      checkRules('593996548952', 'Ecuador', [
        ['099 6548952', '593996548952'],
        ['096 9856985', '593969856985'],
        ['097 9652585', '593979652585'],
        ['095 9457125', '593959457125'],
        ['04  2382808', '59342382808']
      ]);

      checkRules('59342382808', 'Ecuador', [
        ['096 9856985', '593969856985'],
        ['+5216241431234', '526241431234']
      ]);

      checkRules('5491112345678', 'Argentina', [
        ['5491112345678', '5491112345678'],
        ['1512345678', '5491112345678'],
        [' 1512 345678 ', '5491112345678'],
        ['12345678', '5491112345678'],
        ['111512345678', '5491112345678'],
        ['0111512345678', '5491112345678'],
        ['1112345678', '5491112345678']
      ]);

      checkRules('541112345678', 'Argentina', [
        ['+34 666 66 66 66', '34666666666'],
        ['1140734286', '5491140734286'],
        ['01140734286', '5491140734286'],
        ['+5216241431234', '526241431234']
      ]);

      checkRules('523311228895', 'Mexico', [
        ['5213311228895', '523311228895'],
        ['3311228895', '523311228895']
      ]);
      checkRules('5213311228895', 'Mexico', [
        ['5213311228895', '523311228895']
      ]);
    });
  });
});
