<template>
  <q-page ref="pageBudget">
    <q-pull-to-refresh @refresh="refresh">
      <div
        class="
          text-h4
          full-width
          text-center text-weight-bold
          q-pt-lg q-pb-xs
          bg-grey-3
          text-grey-6
        "
        v-ripple="{ color: 'primary' }"
      >
        <span class="text-caption" style="vertical-align: super">PHP</span>
        <span
          :class="walletBalance >= 0 ? 'text-primary' : 'text-red'"
          @dblclick="popupDetails"
        >
          {{ moneyFormat(walletBalance) }}
        </span>
        <q-btn
          flat
          round
          dense
          ripple
          size="md"
          color="primary"
          @click="popupDetails"
          icon="add_circle_outline"
        ></q-btn>
        <p class="text-caption">Available Balance</p>
      </div>

      <div v-if="transactions.length">
        <transition
          appear
          enter-active-class="animated bounce slow"
          leave-active-class="animated fadeOutDown slow"
        >
          <q-card class="transparent no-shadow no-border">
            <q-card-section
              class="
                fit
                row
                wrap
                full-width
                items-center
                justify-evenly
                content-center
              "
            >
              <q-item
                class="
                  col-xs-12 col-sm-4 col-md-2 col-lg-2
                  q-mx-sm q-mt-sm
                  bg-primary
                "
                v-ripple="{ color: 'white' }"
              >
                <q-item-section side class="q-pa-md text-white bg-accent">
                  <q-icon name="analytics" color="white" size="md"></q-icon>
                </q-item-section>
                <q-item-section class="text-white q-pl-md">
                  <q-item-label class="text-h6 text-weight-bolder">
                    {{
                      moneyFormat(
                        filteredTransactionThisDay
                          ? filteredTransactionThisDay.money
                          : 0
                      )
                    }}
                  </q-item-label>
                  <q-item-label>This Day</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                style="background-color: #f37169"
                class="col-xs-12 col-sm-4 col-md-2 col-lg-2 q-mx-sm q-mt-sm"
                v-ripple="{ color: 'white' }"
              >
                <q-item-section
                  side
                  style="background-color: #f34636"
                  class="q-pa-md text-white"
                >
                  <q-icon name="date_range" size="md"></q-icon>
                </q-item-section>
                <q-item-section class="text-white q-pl-md">
                  <q-item-label class="text-h6 text-weight-bolder">
                    {{
                      moneyFormat(
                        filteredTransactionThisWeek
                          ? filteredTransactionThisWeek.money
                          : 0
                      )
                    }}
                  </q-item-label>
                  <q-item-label>This Week</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                style="background-color: #e4b021"
                class="col-xs-12 col-sm-4 col-md-2 col-lg-2 q-mx-sm q-mt-sm"
                v-ripple="{ color: 'white' }"
              >
                <q-item-section
                  side
                  style="background-color: #d3a424"
                  class="q-pa-md text-white"
                >
                  <q-icon name="calendar_today" size="md"></q-icon>
                </q-item-section>
                <q-item-section class="text-white q-pl-md">
                  <q-item-label class="text-h6 text-weight-bolder">
                    {{
                      moneyFormat(
                        filteredTransactionThisMonth
                          ? filteredTransactionThisMonth.money
                          : 0
                      )
                    }}
                  </q-item-label>
                  <q-item-label>This Month</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                style="background-color: #a270b1"
                class="col-xs-12 col-sm-4 col-md-2 col-lg-2 q-mx-sm q-mt-sm"
                v-ripple="{ color: 'white' }"
              >
                <q-item-section
                  side
                  style="background-color: #9f52b1"
                  class="q-pa-md text-white"
                >
                  <q-icon name="bar_chart" size="md"></q-icon>
                </q-item-section>
                <q-item-section class="text-white q-pl-md">
                  <q-item-label class="text-h6 text-weight-bolder">
                    {{
                      moneyFormat(
                        filteredTransactionThisYear
                          ? filteredTransactionThisYear.money
                          : 0
                      )
                    }}
                  </q-item-label>
                  <q-item-label>This Year</q-item-label>
                </q-item-section>
              </q-item>
            </q-card-section>
          </q-card>
        </transition>

        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
        >
          <q-list separator>
            <q-item-section>
              <q-item-label header>Transaction History</q-item-label>
            </q-item-section>
            <transition-group
              appear
              enter-active-class="animated fadeIn slow"
              leave-active-class="animated fadeOutBottomRight slow"
            >
              <q-item
                :key="trans.id"
                :ref="trans.id"
                class="q-py-md"
                style="cursor: pointer"
                v-for="trans in transactions"
                v-ripple="{ color: 'primary' }"
              >
                <q-item-section top avatar>
                  <q-avatar
                    :color="trans.type == 'debit' ? 'positive' : 'negative'"
                    text-color="white"
                    :icon="
                      trans.type == 'debit'
                        ? 'fas fa-angle-double-up'
                        : 'fas fa-angle-double-down'
                    "
                  />
                </q-item-section>

                <q-item-section>
                  <q-item-label>
                    {{
                      (trans.type == "debit" ? "+" : "-") +
                      moneyFormat(trans.money)
                    }}
                  </q-item-label>
                  <q-item-label caption lines="2">
                    {{ trans.description }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side top>
                  <q-item-label caption :key="minuteTimer">
                    {{ relativeDate(trans.timestamp) }}
                  </q-item-label>
                  <div>
                    <q-btn
                      flat
                      round
                      dense
                      ripple
                      icon="edit"
                      color="grey-6"
                      @click="popupDetails(trans)"
                    >
                      <q-tooltip
                        anchor="bottom middle"
                        self="top middle"
                        :offset="[10, 10]"
                        :delay="100"
                      >
                        Edit
                      </q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                      ripple
                      color="grey-6"
                      icon="delete_outline"
                      @click="deleteTransaction(trans)"
                    >
                      <q-tooltip
                        anchor="bottom middle"
                        self="top middle"
                        :offset="[10, 10]"
                        :delay="100"
                      >
                        Delete
                      </q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                      ripple
                      :icon="trans.stared ? 'star' : 'star_outline'"
                      :color="trans.stared ? 'primary' : 'grey-6'"
                      @click="
                        updateTransaction(trans.id, { stared: !trans.stared })
                      "
                    >
                      <q-tooltip
                        anchor="bottom middle"
                        self="top middle"
                        :offset="[10, 10]"
                        :delay="100"
                      >
                        Important
                      </q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
            </transition-group>
            <q-item class="q-py-lg">
              <q-item-section>
                <q-item-label
                  caption
                  class="text-center text-grey-6 text-weight-light"
                >
                  <q-icon name="horizontal_rule" />
                  End of History
                  <q-icon name="horizontal_rule" />
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </transition>
      </div>
      <div v-else class="no-history text-center q-mt-xl">
        <q-icon name="fab fa-wpforms" size="100px" color="primary"></q-icon>
        <div class="text-h5 text-primary">No Transaction</div>
      </div>
    </q-pull-to-refresh>

    <q-dialog v-model="dialogDetails">
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-section class="row items-center">
          <q-avatar icon="fab fa-wpforms" color="primary" text-color="white" />
          <span class="q-ml-sm text-subtitle1">Transaction Details</span>
        </q-card-section>

        <div class="q-px-lg">
          <q-input
            autofocus
            lazy-rules
            tabindex="1"
            type="number"
            class="q-py-sm"
            ref="formDetails1"
            reverse-fill-mask
            placeholder="Money"
            v-model="newTransaction.money"
            @keyup="updateNewTransactionType"
            @focus="updateNewTransactionType"
            :rules="[(val) => checker.input(!!val || '', 500)]"
          >
            <template v-slot:prepend>₱</template>
          </q-input>

          <q-input
            autogrow
            lazy-rules
            tabindex="2"
            maxlength="128"
            class="q-py-sm"
            ref="formDetails2"
            placeholder="Description"
            v-model="newTransaction.description"
            :rules="[(val) => checker.input(!!val || '', 500)]"
          >
            <template v-slot:prepend>
              <q-icon round dense flat size="xs" name="fab fa-wpforms" />
            </template>
            <template v-slot:append>
              <q-btn
                flat
                round
                dense
                ripple
                icon="clear"
                v-if="newTransaction.description"
                @click="newTransaction.description = ''"
              />
            </template>
          </q-input>

          <q-select
            label="Type"
            tabindex="3"
            lazy-rules
            ref="formDetails3"
            :options="transactionTypes"
            v-model="newTransaction.type"
            :rules="[(val) => checker.input(!!val || '', 500)]"
            options-selected-class="text-primary"
          >
            <template v-slot:prepend>
              <q-icon round dense flat size="xs" name="vertical_align_center" />
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon :name="scope.opt.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label v-html="scope.opt.label" />
                  <q-item-label caption
                    >{{ scope.opt.description }}.</q-item-label
                  >
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <q-card-actions align="right">
          <q-btn
            flat
            ripple
            label="Cancel"
            type="reset"
            color="grey-6"
            v-close-popup
            ref="formDetailsReset"
            @click="resetNewTransaction"
          />
          <q-btn
            flat
            ripple
            label="Confirm"
            color="primary"
            ref="formDetailsSubmit"
            v-close-popup="transactionStatus"
            @click="
              editing ? updateTransactionDetails(editing) : addNewTransaction()
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, reactive } from "vue";
import { mixinMethods, mixinTimer } from "src/mixins";
import { useQuasar, date } from "quasar";
import { mapActions, mapState, mapGetters } from "vuex";
import { customAlert, check } from "src/assets/scripts/functions";

export default defineComponent({
  name: "Budget App",

  mixins: [mixinMethods, mixinTimer],

  data() {
    return {
      $q: useQuasar(),
      checker: check,
      transactionStatus: null,
      dialogDetails: false,
      transactionTypes: [
        {
          label: "Debit",
          value: "debit",
          description: "Represents a transfer of value to your account",
          icon: "fas fa-angle-double-up",
        },
        {
          label: "Credit",
          value: "credit",
          description: "Represents a transfer from your account",
          icon: "fas fa-angle-double-down",
        },
      ],
      newTransaction: {
        money: null,
        type: null,
        description: "",
        stared: false,
        timestamp: Date.now(),
      },
      editing: "",
    };
  },

  beforeMount() {
    if (this.userDetails.passphrase && !this.transactions.length)
      this.firebaseGetAllTransactions();
  },

  mounted() {
    if (
      this.userDetails.passphrase &&
      !this.transactions.length &&
      this.transactions.length
    )
      this.firebaseGetAllTransactions();
  },

  computed: {
    ...mapState("firebase_auth", ["userDetails"]),
    ...mapState("firebase_budget", ["transactions"]),
    ...mapGetters("firebase_budget", [
      "walletBalance",
      "transactionsDebit",
      "transactionsCredit",
    ]),

    filteredTransactionThisDay() {
      return this.filterTransaction("thisDay");
    },

    filteredTransactionThisWeek() {
      return this.filterTransaction("thisWeek");
    },

    filteredTransactionThisMonth() {
      return this.filterTransaction("thisMonth");
    },

    filteredTransactionThisYear() {
      return this.filterTransaction("thisYear");
    },
  },

  methods: {
    ...mapActions("firebase_budget", [
      "firebaseAddTransaction",
      "firebaseUpdateTransaction",
      "firebaseDeleteTransaction",
      "firebaseGetAllTransactions",
      "firebaseStopGettingTransactions",
    ]),

    async popupDetails(editTransaction = null) {
      this.dialogDetails = !this.dialogDetails;
      if (editTransaction != null) {
        this.editing = editTransaction.id;
        this.newTransaction.money =
          editTransaction.type == "credit"
            ? -1 * editTransaction.money
            : editTransaction.money;
        this.newTransaction.description = editTransaction.description;
      } else {
        this.editing = "";
      }
    },
    refresh(done) {
      setTimeout(() => {
        this.firebaseGetAllTransactions();
        done();
      }, 1000);
    },
    ruleReset() {
      inputRef.value.resetValidation();
    },
    moneyFormat(amount) {
      return Number(amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    resetNewTransaction() {
      this.newTransaction = {
        money: null,
        type: null,
        description: null,
        stared: false,
        timestamp: Date.now(),
      };
    },
    async addNewTransaction() {
      customAlert("Adding new transaction...", "ongoing", 50);
      if (
        this.newTransaction.money &&
        this.newTransaction.type &&
        this.newTransaction.description
      ) {
        let transaction = {
          money: Math.abs(this.newTransaction.money),
          type: this.newTransaction.type.value,
          description: this.newTransaction.description,
          stared: this.newTransaction.stared,
          timestamp: Date.now(),
        };
        this.transactionStatus = true;
        const status = await this.firebaseAddTransaction(transaction);
        if (status.success) {
          setTimeout(() => {
            customAlert("Transaction has been added.", "positive");
          }, 300);
        } else {
          setTimeout(() => {
            customAlert("Failed to add transaction.", "negative");
          }, 300);
        }
        this.resetNewTransaction();
      } else {
        this.transactionStatus = false;
        setTimeout(() => {
          customAlert(
            "Failed! Plese complete all the details needed.",
            "warning"
          );
        }, 1000);
      }
    },
    deleteTransaction(transaction) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Delete transaction permanently?",
          cancel: true,
          persistent: false,
        })
        .onOk(() => {
          let status = this.firebaseDeleteTransaction(transaction);
          if (status) {
            setTimeout(() => {
              customAlert("Transaction has been deleted.", "positive");
            }, 100);
          } else {
            setTimeout(() => {
              customAlert("Error deleting transaction.", "negative");
            }, 100);
          }
        });
    },
    updateTransaction(id, updatedTransaction) {
      this.firebaseUpdateTransaction({
        id: id,
        updates: updatedTransaction,
      });
    },
    updateTransactionDetails(transaction) {
      this.firebaseUpdateTransaction({
        id: transaction,
        updates: {
          money: Math.abs(this.newTransaction.money),
          type: this.newTransaction.type.value,
          description: this.newTransaction.description,
        },
      });
      this.transactionStatus = true;
      setTimeout(() => {
        customAlert("Transaction has been updated.", "positive");
      }, 300);
      this.resetNewTransaction();
    },
    updateNewTransactionType() {
      if (this.newTransaction.money > 0) {
        this.newTransaction.type = this.transactionTypes[0];
      } else {
        this.newTransaction.type = this.transactionTypes[1];
      }
    },
    filterTransaction(type) {
      let result = reactive({
        sum: 0,
        money: 0,
        data: {},
        debit: {
          sum: 0,
          data: {},
        },
        credit: {
          sum: 0,
          data: {},
        },
      });
      // all filtered transactions
      const filtered = this.filterTransactionData(this.transactions, type);
      filtered.forEach((e) => {
        result.sum += e.money;
      });
      result.data = filtered;
      // all filtered debit transactions
      const filteredDebit = Object.keys(this.transactionsDebit).length
        ? this.filterTransactionData(this.transactionsDebit.data, type)
        : [];
      filteredDebit.forEach((e) => {
        result.debit.sum += e.money;
      });
      result.debit.data = filteredDebit;
      // all filtered credit transactions
      const filteredCredit = Object.keys(this.transactionsCredit).length
        ? this.filterTransactionData(this.transactionsCredit.data, type)
        : [];
      filteredCredit.forEach((e) => {
        result.credit.sum += e.money;
      });
      result.credit.data = filteredCredit;
      // result
      result.money = result.debit.sum - result.credit.sum;
      return result;
    },
    filterTransactionData(array = [], type) {
      const thisDay = new Date().setHours(0, 0, 0, 0);
      const startWeek = date.subtractFromDate(new Date(thisDay), {
        days: date.getDayOfWeek(thisDay),
      });
      return array.filter((e) => {
        switch (type) {
          case "thisDay":
            return (
              date.getDateDiff(new Date(), new Date(e.timestamp), "days") < 1
            );
          case "thisMonth":
            return (
              date.getDateDiff(new Date(), new Date(e.timestamp), "months") < 1
            );
          case "thisYear":
            return (
              date.getDateDiff(new Date(), new Date(e.timestamp), "years") < 1
            );
          case "thisWeek":
            return date.isBetweenDates(
              new Date(e.timestamp),
              new Date(startWeek),
              new Date(thisDay),
              { inclusiveFrom: true, inclusiveTo: true, onlyDate: true }
            );
          default:
            return true;
        }
      });
    },
  },

  beforeUnmount() {
    this.firebaseStopGettingTransactions();
  },
});
</script>

<style lang="sass">
.no-history
  opacity: 0.5
</style>
