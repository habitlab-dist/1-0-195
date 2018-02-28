
    // iOS doesn't support arrow keys etc.
    if (!ios) {
      describe('keyboard navigation', function() {

        var target;
        var overlay;

        function arrowDown() {
          MockInteractions.keyDownOn(target, 40);
        }

        function arrowRight() {
          MockInteractions.keyDownOn(target, 39);
        }

        function arrowUp() {
          MockInteractions.keyDownOn(target, 38);
        }

        function arrowLeft() {
          MockInteractions.keyDownOn(target, 37);
        }

        function home() {
          MockInteractions.keyDownOn(target, 36);
        }

        function end() {
          MockInteractions.keyDownOn(target, 35);
        }

        function pageDown(modifiers) {
          MockInteractions.keyDownOn(target, 34, modifiers);
        }

        function pageUp(modifiers) {
          MockInteractions.keyDownOn(target, 33, modifiers);
        }

        function enter() {
          MockInteractions.pressEnter(target);
        }

        function space() {
          MockInteractions.pressSpace(target);
        }

        function esc() {
          MockInteractions.keyDownOn(target, 27);
        }

        function focusedDate() {
          return overlay.focusedDate;
        }

        describe('date-picker', function() {
          var datepicker;

          beforeEach(function() {
            datepicker = fixture('datepicker');
            overlay = datepicker.$.overlay;
          });

          it('should open overlay on down', function() {
            target = datepicker.$.input;
            arrowDown();

            expect(datepicker.opened).to.be.true;
          });

          it('should open overlay on up', function() {
            target = datepicker.$.input;
            arrowUp();

            expect(datepicker.opened).to.be.true;
          });

          it('should close overlay on esc', function(done) {
            datepicker.open();
            target = datepicker.$.overlay;
            datepicker.async(function() {
              esc();
              expect(datepicker.opened).to.be.false;
              done();
            }, 1);
          });

          it('should be focused on selected value when overlay is opened', function() {
            datepicker.value = '2001-01-01';

            datepicker.open();
            target = overlay;
            arrowRight();

            expect(focusedDate()).to.eql(new Date(2001, 0, 2));
          });

          it('should be focused on initial position when no value is set', function(done) {
            datepicker.value = null;
            datepicker.initialPosition = '2001-01-01';

            datepicker.open();
            target = overlay;

            // wait for the 'iron-overlay-opened' to be fired to that the initialPosition
            // is set to the overlay.
            datepicker.async(function() {
              arrowRight();

              expect(focusedDate()).to.eql(new Date(2001, 0, 2));
              done();
            }, 1);
          });

          it('should be focused on today if no initial position is set', function() {
            var today = new Date();
            datepicker.value = null;
            datepicker.initialPosition = null;

            datepicker.open();
            target = overlay;
            arrowRight();

            expect(focusedDate()).to.eql(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));
          });

          it('should not lose focused date after deselecting', function() {
            var _focused = focusedDate();
            datepicker.open();
            target = overlay;
            space();
            space();

            expect(focusedDate()).to.equal(_focused);
          });
        });

        describe('overlay', function() {

          beforeEach(function(done) {
            overlay = fixture('overlay');
            overlay.i18n = getDefaultI18n();
            target = overlay;

            overlay.initialPosition = new Date();
            overlay.focusedDate = new Date(2000, 0, 1);

            overlay.scrollToDate(overlay.focusedDate);
            listenForEvent(overlay, 'scroll-animation-finished', function() {
              Polymer.RenderStatus.afterNextRender(overlay, done);
            });
          });

          it('should focus one week forward with arrow down', function() {
            arrowDown(overlay);

            expect(overlay.focusedDate).to.eql(new Date(2000, 0, 8));
          });

          it('should focus one week backward with arrow up', function() {
            arrowUp(overlay);

            expect(overlay.focusedDate).to.eql(new Date(1999, 11, 25));
          });

          it('should focus one day forward with arrow right', function() {
            arrowRight();

            expect(overlay.focusedDate).to.eql(new Date(2000, 0, 2));

          });

          it('should focus one day backward with arrow left', function() {
            arrowLeft();

            expect(overlay.focusedDate).to.eql(new Date(1999, 11, 31));
          });

          it('should close overlay with enter', function() {
            var spy = sinon.spy(overlay, '_close');
            enter();

            expect(spy.calledOnce).to.be.true;
          });

          it('should scroll to focused month', function(done) {
            overlay.addEventListener('scroll-animation-finished', function(e) {
              expect(e.detail.position).to.eql(e.detail.oldPosition - 1);
              done();
            });

            arrowUp();
          });

          it('should select a date with space', function() {
            arrowRight();
            space();

            expect(overlay.selectedDate).to.eql(new Date(2000, 0, 2));
          });

          it('should deselect selected date with space', function() {
            space();
            space();

            expect(overlay.selectedDate).to.be.empty;
          });

          it('should focus first day of the month with home', function() {
            arrowLeft();
            home();

            expect(overlay.focusedDate).to.eql(new Date(1999, 11, 1));
          });

          it('should focus last day of the month with end', function() {
            end();

            expect(overlay.focusedDate).to.eql(new Date(2000, 0, 31));
          });

          it('should focus next month with pagedown', function() {
            pageDown();

            expect(focusedDate()).to.eql(new Date(2000, 1, 1));
          });

          it('should focus previous month with pageup', function() {
            pageUp();

            expect(overlay.focusedDate).to.eql(new Date(1999, 11, 1));
          });

          it('should not skip a month', function() {
            overlay.focusedDate = new Date(2000, 0, 31);
            pageDown();

            expect(overlay.focusedDate).to.eql(new Date(2000, 1, 29));
          });

          it('should focus the previously focused date number if available', function() {
            overlay.focusedDate = new Date(2000, 0, 31);
            pageDown();
            pageDown();

            expect(overlay.focusedDate).to.eql(new Date(2000, 2, 31));
          });

          it('should focus next year with shift and pagedown', function() {
            pageDown('shift');

            expect(overlay.focusedDate).to.eql(new Date(2001, 0, 1));
          });

          it('should focus previous year with shift and pageup', function() {
            pageUp('shift');

            expect(overlay.focusedDate).to.eql(new Date(1999, 0, 1));
          });

          it('should scroll up when focus goes invisible', function(done) {
            overlay.addEventListener('scroll-animation-finished', function(e) {
              expect(e.detail.position).to.eql(e.detail.oldPosition - 12);
              done();
            });

            pageUp('shift');
          });

          it('should not scroll down when focus keeps visible', function(done) {
            var initialPosition = overlay.$.scroller.position;

            pageDown();

            setTimeout(function() {
              expect(overlay.$.scroller.position).to.eql(initialPosition);
              done();
            });
          });

          it('should scroll down when focus goes invisible', function(done) {
            overlay.addEventListener('scroll-animation-finished', function(e) {
              expect(e.detail.position).to.be.greaterThan(e.detail.oldPosition);
              done();
            });

            pageDown('shift');
          });

          it('should not focus on today click if no date focused', function() {
            overlay.focusedDate = null;
            overlay._scrollToCurrentMonth();
            expect(overlay.focusedDate).to.be.null;
          });

          it('should focus on today click if a date is focused', function() {
            arrowRight();
            overlay._scrollToCurrentMonth();
            expect(overlay.focusedDate.getFullYear()).to.eql(new Date().getFullYear());
            expect(overlay.focusedDate.getMonth()).to.eql(new Date().getMonth());
            expect(overlay.focusedDate.getDate()).to.eql(new Date().getDate());
          });

          it('should move to max date when targeted date is disabled', function() {
            overlay.maxDate = new Date(2000, 0, 7);

            arrowDown(overlay);

            expect(overlay.focusedDate).to.eql(new Date(2000, 0, 7));
          });

          it('should move to min date when targeted date is disabled', function() {
            overlay.minDate = new Date(1999, 11, 26);

            arrowUp(overlay);

            expect(overlay.focusedDate).to.eql(new Date(1999, 11, 26));
          });

          it('should focus min date with home', function() {
            overlay.minDate = new Date(1999, 11, 3);

            arrowLeft();
            home();

            expect(overlay.focusedDate).to.eql(new Date(1999, 11, 3));
          });

          it('should focus max date with end', function() {
            overlay.maxDate = new Date(2000, 0, 26);

            end();

            expect(overlay.focusedDate).to.eql(new Date(2000, 0, 26));
          });

          it('should focus max date with pagedown', function() {
            overlay.maxDate = new Date(2000, 0, 28);

            pageDown();

            expect(overlay.focusedDate).to.eql(new Date(2000, 0, 28));
          });

          it('should focus min date with pageup', function() {
            overlay.minDate = new Date(1999, 11, 3);

            pageUp();

            expect(overlay.focusedDate).to.eql(new Date(1999, 11, 3));
          });

          it('should focus max date with shift and pagedown', function() {
            overlay.maxDate = new Date(2000, 11, 28);

            pageDown('shift');

            expect(overlay.focusedDate).to.eql(new Date(2000, 11, 28));
          });

          it('should focus min date with shift and pageup', function() {
            overlay.minDate = new Date(1999, 5, 3);

            pageUp('shift');

            expect(overlay.focusedDate).to.eql(new Date(1999, 5, 3));
          });

          it('should focus the closest allowed date with pageup when selected date is disabled', function() {
            overlay.focusedDate = new Date(1999, 5, 10);
            overlay.minDate = new Date(1999, 11, 25);

            pageUp();

            expect(overlay.focusedDate).to.eql(new Date(1999, 11, 25));
          });

          it('should focus the closest allowed date with pagedown when selected date is disabled', function() {
            overlay.focusedDate = new Date(1999, 5, 10);
            overlay.minDate = new Date(1999, 11, 25);

            pageDown();

            expect(overlay.focusedDate).to.eql(new Date(1999, 11, 25));
          });

          it('should focus the closest allowed date with shift pageup when selected date is disabled', function() {
            overlay.focusedDate = new Date(1999, 5, 10);
            overlay.minDate = new Date(1999, 11, 25);

            pageUp('shift');

            expect(overlay.focusedDate).to.eql(new Date(1999, 11, 25));
          });

          it('should focus the closest allowed date with shift pagedown when selected date is disabled', function() {
            overlay.focusedDate = new Date(1999, 5, 10);
            overlay.minDate = new Date(1999, 11, 25);

            pageUp('shift');

            expect(overlay.focusedDate).to.eql(new Date(1999, 11, 25));
          });

          it('should focus the closest allowed date with home when selected date is disabled', function() {
            overlay.focusedDate = new Date(1999, 5, 10);
            overlay.minDate = new Date(1999, 11, 25);

            home();

            expect(overlay.focusedDate).to.eql(new Date(1999, 11, 25));
          });

          it('should focus the closest allowed date with end when selected date is disabled', function() {
            overlay.focusedDate = new Date(1999, 5, 10);
            overlay.minDate = new Date(1999, 11, 25);

            end();

            expect(overlay.focusedDate).to.eql(new Date(1999, 11, 25));
          });

          it('should focus the closest allowed date with arrow up when selected date is disabled', function() {
            overlay.focusedDate = new Date(1999, 5, 10);
            overlay.minDate = new Date(1999, 11, 25);

            arrowUp(overlay);

            expect(overlay.focusedDate).to.eql(new Date(1999, 11, 25));
          });

          it('should focus the closest allowed date with arrow down when selected date is disabled', function() {
            overlay.focusedDate = new Date(1999, 5, 10);
            overlay.minDate = new Date(1999, 11, 25);

            arrowDown(overlay);

            expect(overlay.focusedDate).to.eql(new Date(1999, 11, 25));
          });

          it('should focus the closest allowed date with arrow left when selected date is disabled', function() {
            overlay.focusedDate = new Date(1999, 5, 10);
            overlay.minDate = new Date(1999, 11, 25);

            arrowLeft(overlay);

            expect(overlay.focusedDate).to.eql(new Date(1999, 11, 25));
          });

          it('should focus the closest allowed date with arrow right when selected date is disabled', function() {
            overlay.focusedDate = new Date(1999, 5, 10);
            overlay.minDate = new Date(1999, 11, 25);

            arrowRight(overlay);

            expect(overlay.focusedDate).to.eql(new Date(1999, 11, 25));
          });

          it('should focus two-digit years while navigating days', function() {
            var date = new Date(99, 0, 1);
            date.setFullYear(99);
            overlay.focusedDate = date;

            arrowRight(overlay);

            date.setDate(2);
            expect(overlay.focusedDate).to.eql(date);
          });

          it('should focus two-digit years while navigating months', function() {
            var date = new Date(99, 0, 1);
            date.setFullYear(99);
            overlay.focusedDate = date;

            pageDown();

            date.setMonth(1);
            expect(overlay.focusedDate).to.eql(date);
          });

          it('should focus two-digit years while navigating in month', function() {
            var date = new Date(99, 0, 1);
            date.setFullYear(99);
            overlay.focusedDate = date;

            end();

            date.setDate(31);
            expect(overlay.focusedDate).to.eql(date);
          });
        });
      });
    }
  