<template>
  <q-page>
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
      >
        <span class="text-caption" style="vertical-align: super">PHP</span>
        <span
          :class="walletBalance >= 0 ? 'text-primary' : 'text-red'"
          @dblclick="popupDetails"
        >
          {{ moneyFormat(walletBalance) }}
        </span>
        <q-btn
          round
          dense
          flat
          icon="add_circle_outline"
          color="primary"
          size="md"
          @click="popupDetails"
        ></q-btn>
        <p class="text-caption">Available Balance</p>
      </div>

      <div class="q-py-md" v-if="transactions.length">
        <q-card class="bg-transparent no-shadow no-border">
          <q-card-section
            class="
              fit
              row
              wrap
              full-width
              justify-evenly
              items-center
              content-center
            "
          >
            <q-item
              class="
                col-xs-12 col-sm-4 col-md-2 col-lg-2
                q-mx-sm q-mt-sm
                bg-primary
              "
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

        <q-list separator class="q-py-md">
          <q-item-label header>Transaction History</q-item-label>
          <transition-group
            appear
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut"
          >
            <q-item v-for="(trans, key) in transactions" :key="key">
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
                <q-item-label>{{
                  (trans.type == "debit" ? "+" : "-") + moneyFormat(trans.money)
                }}</q-item-label>
                <q-item-label caption lines="2">{{
                  trans.description
                }}</q-item-label>
              </q-item-section>

              <q-item-section side top>
                <q-item-label caption :key="minuteTimer">
                  {{ relativeDate(trans.timestamp) }}
                </q-item-label>
                <div>
                  <q-btn
                    round
                    dense
                    flat
                    icon="edit"
                    color="grey-4"
                    @click="popupDetails(trans)"
                  />
                  <q-btn
                    round
                    dense
                    flat
                    icon="delete_outline"
                    color="grey-4"
                    @click="deleteTransaction(trans)"
                  />
                  <q-btn
                    round
                    dense
                    flat
                    :icon="trans.stared ? 'star' : 'star_outline'"
                    :color="trans.stared ? 'yellow' : 'grey-4'"
                    @click="
                      updateTransaction(trans.id, { stared: !trans.stared })
                    "
                  />
                </div>
              </q-item-section>
            </q-item>
          </transition-group>
        </q-list>
      </div>
      <div v-else class="no-history text-center q-mt-xl">
        <q-icon name="fab fa-wpforms" size="100px" color="primary"></q-icon>
        <div class="text-h5 text-primary">No Transaction History</div>
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
            class="q-py-sm"
            placeholder="Money"
            reverse-fill-mask
            type="number"
            lazy-rules
            :rules="[ruleValidate]"
            v-model="newTransaction.money"
            @keyup="updateNewTransactionType"
            @focus="updateNewTransactionType"
            tabindex="1"
            ref="formDetails1"
          >
            <template v-slot:prepend>₱</template>
          </q-input>

          <q-input
            autogrow
            class="q-py-sm"
            placeholder="Description"
            maxlength="128"
            lazy-rules
            :rules="[ruleValidate]"
            v-model="newTransaction.description"
            tabindex="2"
            ref="formDetails2"
          >
            <template v-slot:prepend>
              <q-icon round dense flat size="xs" name="fab fa-wpforms" />
            </template>
            <template v-slot:append>
              <q-btn
                round
                dense
                flat
                icon="clear"
                v-if="newTransaction.description"
                @click="newTransaction.description = ''"
              />
            </template>
          </q-input>

          <q-select
            options-selected-class="text-primary"
            v-model="newTransaction.type"
            :options="transactionTypes"
            label="Type"
            lazy-rules
            :rules="[ruleValidate]"
            tabindex="3"
            ref="formDetails3"
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
            ref="formDetailsReset"
            label="Cancel"
            type="reset"
            color="grey-6"
            v-close-popup
            @click="resetNewTransaction"
          />
          <q-btn
            flat
            ref="formDetailsSubmit"
            label="Confirm"
            color="primary"
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
import { defineComponent, ref, reactive } from "vue";
import { mixinMethods, mixinTimer } from "src/mixins";
import { useQuasar, date } from "quasar";
import { mapActions, mapState, mapGetters } from "vuex";

export default defineComponent({
  name: "Budget App",

  mixins: [mixinMethods, mixinTimer],

  data() {
    return {
      $q: useQuasar(),
      transactionStatus: ref(null),
      dialogDetails: ref(false),
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
        money: ref(null),
        type: ref(null),
        description: "",
        stared: false,
        timestamp: Date.now(),
      },
      editing: "",
    };
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

  created() {
    if (!Object.keys(this.userDetails).length) this.$router.push("/");
  },

  methods: {
    ...mapActions("firebase_budget", [
      "firebaseAddTransaction",
      "firebaseUpdateTransaction",
      "firebaseDeleteTransaction",
    ]),

    popupDetails(editTransaction = null) {
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
        done();
      }, 1000);
    },
    ruleValidate(val) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(!!val || "");
        }, 1000);
      });
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
        money: ref(null),
        type: ref(null),
        description: ref(null),
        stared: false,
        timestamp: Date.now(),
      };
    },
    async addNewTransaction() {
      this.customAlert("Adding new transaction...", "ongoing", 50);
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
            this.customAlert("Transaction has been added.", "positive");
          }, 300);
        } else {
          setTimeout(() => {
            this.customAlert("Failed to add transaction.", "negative");
          }, 300);
        }
        this.resetNewTransaction();
      } else {
        this.transactionStatus = false;
        setTimeout(() => {
          this.customAlert(
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
              this.customAlert("Transaction has been deleted.", "positive");
            }, 100);
          } else {
            setTimeout(() => {
              this.customAlert("Error deleting transaction.", "negative");
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
        this.customAlert("Transaction has been updated.", "positive");
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
    customAlert(message, type, timeout = 1000, position = null) {
      if (!type || !message) return;
      let config = {
        type: type,
        message: message,
        timeout: timeout,
      };
      if (position) config.position = position;
      this.$q.notify(config);
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
});
</script>

<style lang="sass">
.no-history
  opacity: 0.5
</style>
