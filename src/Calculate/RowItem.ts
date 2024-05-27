class BucketRowItem {
  startingValue: number = 0
  stockAppreciation: number = 0
  dividends: number = 0
  contributions: number = 0
  withdrawals: number = 0
  endingValue: number = 0

  constructor() {}

  calculate() {
    this.endingValue =
      this.startingValue +
      this.stockAppreciation +
      this.dividends +
      this.contributions -
      this.withdrawals
  }
}

export class RowItem extends BucketRowItem {
  month: number
  bucket1: BucketRowItem
  bucket2: BucketRowItem
  bucket3: BucketRowItem
  reachedGoal: boolean = false
  constructor(month: number) {
    super()
    this.month = month
    this.bucket1 = new BucketRowItem()
    this.bucket2 = new BucketRowItem()
    this.bucket3 = new BucketRowItem()
  }

  calculate() {
    this.bucket1.calculate()
    this.bucket2.calculate()
    this.bucket3.calculate()
    this.startingValue =
      this.bucket1.startingValue +
      this.bucket2.startingValue +
      this.bucket3.startingValue
    this.stockAppreciation =
      this.bucket1.stockAppreciation +
      this.bucket2.stockAppreciation +
      this.bucket3.stockAppreciation
    this.dividends =
      this.bucket1.dividends + this.bucket2.dividends + this.bucket3.dividends
    this.contributions =
      this.bucket1.contributions +
      this.bucket2.contributions +
      this.bucket3.contributions
    this.withdrawals =
      this.bucket1.withdrawals +
      this.bucket2.withdrawals +
      this.bucket3.withdrawals
    this.endingValue =
      this.bucket1.endingValue +
      this.bucket2.endingValue +
      this.bucket3.endingValue
  }
}
