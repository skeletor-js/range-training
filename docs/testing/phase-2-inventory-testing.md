# Phase 2: Inventory Enhancement Testing

## Purchase History

### Adding Purchases
- [ ] Log new purchase with all fields
- [ ] Log purchase with minimum required fields
- [ ] Verify purchase appears in history
- [ ] Verify ammo round count increases
- [ ] Can add multiple purchases for same ammo type

### Purchase History View
- [ ] Open purchase history sheet
- [ ] Purchases sorted by date (newest first)
- [ ] Purchase details display correctly (qty, price, seller, date)
- [ ] Delete purchase from history
- [ ] Verify round count adjusts on delete

## Price Per Round (PPR) Metrics

### Calculations
- [ ] Current PPR shows most recent purchase
- [ ] Average PPR calculates correctly across all purchases
- [ ] Lowest PPR identifies best deal
- [ ] Highest PPR identifies most expensive
- [ ] Best seller displays correctly
- [ ] Total spent accumulates correctly

### Display
- [ ] PPR shows on ammo card
- [ ] PPR trend indicator shows (up/down/stable)
- [ ] Colors indicate good (green) vs bad (red) deals
- [ ] Currency formatting is correct ($X.XXX)

### Edge Cases
- [ ] Single purchase shows correct metrics
- [ ] Zero quantity handled gracefully
- [ ] Very high/low prices display correctly

## Ammo Reviews & Ratings

### Star Rating
- [ ] Can set 1-5 star rating
- [ ] Rating persists after save
- [ ] Rating shows on ammo card
- [ ] Can change existing rating

### Reliability Rating
- [ ] Can set reliability (excellent/good/fair/poor)
- [ ] Rating badge displays correctly
- [ ] Rating shows correct color

### Accuracy Rating
- [ ] Can set accuracy (excellent/good/fair/poor)
- [ ] Rating badge displays correctly
- [ ] Rating shows correct color

### Review Notes
- [ ] Can add review notes
- [ ] Notes persist after save
- [ ] Can edit existing notes
- [ ] Long notes display correctly

## Compatibility Tracking

### Creating Compatibility Records
- [ ] Open compatibility form for firearm
- [ ] Only matching caliber ammo shows
- [ ] Can select ammo type
- [ ] Can set performance rating
- [ ] Can add load notes
- [ ] Can mark as tested
- [ ] Tested date saves correctly

### Viewing Compatibility
- [ ] Compatibility list shows for firearm
- [ ] Displays ammo name/brand
- [ ] Shows performance rating
- [ ] Shows tested status
- [ ] Shows last tested date

### Managing Compatibility
- [ ] Edit existing compatibility record
- [ ] Delete compatibility record
- [ ] Records persist after app restart

### Edge Cases
- [ ] No ammo of matching caliber shows message
- [ ] Empty compatibility list shows message
- [ ] Duplicate ammo prevented

## Integration Tests

### Purchase + Ratings Flow
- [ ] Add purchase, then add rating
- [ ] PPR displays alongside rating
- [ ] Both visible on ammo card

### Compatibility + Session Flow
- [ ] Set compatibility for firearm-ammo
- [ ] Use that combo in session
- [ ] Compatibility info accessible after session

## Cross-Platform Tests

### Mobile
- [ ] Sheet opens correctly on mobile
- [ ] Touch targets adequate size
- [ ] Keyboard doesn't obscure inputs

### Desktop
- [ ] All forms work with mouse
- [ ] Tab navigation works
- [ ] Forms submit on Enter

## Offline Testing

- [ ] Can add purchases offline
- [ ] Can add ratings offline
- [ ] Can set compatibility offline
- [ ] Data persists after going online
